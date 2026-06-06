import { useState, useEffect } from 'react';
import { usePO } from '../contexts/POContext';
import { useActivity } from '../contexts/ActivityContext';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import FormInput from '../components/forms/FormInput';
import { generatePO } from '../services/poService';

export default function PurchaseOrders() {
  const { pos, setPOs, fetchPOs } = usePO();

  useEffect(() => {
    fetchPOs();
  }, []);
  const { addLog } = useActivity();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ vendorId: '', total: '' });

  const handleGenerate = async (e) => {
    e.preventDefault();
    const res = await generatePO({ ...form, status: 'Draft' });
    setPOs([...pos, res.data]);
    addLog(`Generated Purchase Order for Vendor ${form.vendorId}`);
    setIsModalOpen(false);
    setForm({ vendorId: '', total: '' });
  };

  const columns = [
    { header: 'PO ID', accessor: 'id' },
    { header: 'Vendor ID', accessor: 'vendorId' },
    { header: 'Total Amount', accessor: 'total' },
    { header: 'Status', accessor: 'status' }
  ];

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Purchase Orders</h2>
        <Button onClick={() => setIsModalOpen(true)}>Generate PO</Button>
      </div>
      <Table columns={columns} data={pos} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate PO">
        <form onSubmit={handleGenerate}>
          <FormInput label="Vendor ID" value={form.vendorId} onChange={(e) => setForm({...form, vendorId: e.target.value})} required />
          <FormInput label="Total Amount ($)" type="number" value={form.total} onChange={(e) => setForm({...form, total: e.target.value})} required />
          <Button type="submit" className="w-full">Generate</Button>
        </form>
      </Modal>
    </div>
  );
}