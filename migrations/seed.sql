INSERT INTO users (email, password, role) VALUES
('admin@hackathon.com', '$2a$10$7R9M3Zg8RdfXFvJ6H3v8eO6pY2yR.Gg3Wb7yXb5R6H1mN5YfFwO2.', 'admin'),
('user1@hackathon.com', '$2a$10$7R9M3Zg8RdfXFvJ6H3v8eO6pY2yR.Gg3Wb7yXb5R6H1mN5YfFwO2.', 'user'),
('user2@hackathon.com', '$2a$10$7R9M3Zg8RdfXFvJ6H3v8eO6pY2yR.Gg3Wb7yXb5R6H1mN5YfFwO2.', 'user'),
('user3@hackathon.com', '$2a$10$tNO.29Odn6rt0r9beqf.we.eh/tf8MaKklvMX9tTV8kx7CQ4D0Msm', 'user'),
('kjhgfdsa1014@gmail.com', '$2a$10$tNO.29Odn6rt0r9beqf.we.eh/tf8MaKklvMX9tTV8kx7CQ4D0Msm', 'user')
ON CONFLICT (email) DO NOTHING;
