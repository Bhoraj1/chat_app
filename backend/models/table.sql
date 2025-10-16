CREATE TABLE users (
    id  INT PRIMARY KEY AUTO_INCREMENT,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profilePic VARCHAR(255),
    created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE messages(
  id INT PRIMARY KEY AUTO_INCREMENT,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  text TEXT,
  image VARCHAR(255),
  created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (senderId) REFERENCES users(id),
  FOREIGN KEY (receiverId) REFERENCES users(id)
);
