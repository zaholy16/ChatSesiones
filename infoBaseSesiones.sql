CREATE DATABASE nodelogin;
USE nodelogin;

CREATE TABLE accounts(
id int(11) NOT NULL AUTO_INCREMENT,
username varchar(50) NOT NULL,
password varchar(255) NOT NULL,
email varchar(100) NOT NULL,
primary key(id)
);

INSERT INTO accounts(id, username, password, email) VALUES (1, 'test', 'test', 'test@test.com'); 
INSERT INTO accounts(id, username, password, email) VALUES (2, 'test2', 'test2', 'test2@test.com'); 

select * from accounts;