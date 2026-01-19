-- audiohub.users definition

CREATE TABLE audiohub.users (
	id INT auto_increment NOT NULL,
	username varchar(100) NOT NULL,
	password varchar(100) NOT NULL,
	CONSTRAINT users_pk PRIMARY KEY (id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;
DROP TABLE IF EXISTS audiohub.users;
