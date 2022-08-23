CREATE TYPE ACCOUNT_TYPE AS ENUM ('corrente', 'poupanca', 'salario', 'conjunta')

CREATE TABLE management.person (
	id BIGSERIAL,
	name VARCHAR(300) NOT NULL,
	document_number VARCHAR(11) NOT NULL,
	birth_date DATE NOT NULL,

	PRIMARY KEY (id)
)

CREATE TABLE management.account (
	id BIGSERIAL,
	person_id BIGINT NOT NULL,
	balance MONEY NOT NULL,
	daily_withdrawal_limit MONEY,
	is_active BOOLEAN NOT NULL,
	type ACCOUNT_TYPE NOT NULL,
	created_at TIMESTAMP NOT NULL,
	
	PRIMARY KEY(id),
	FOREIGN KEY (person_id)
		REFERENCES management.person(id)
)

CREATE TABLE management.transaction (
	id BIGSERIAL,
	account_id BIGINT NOT NULL,
	amount MONEY NOT NULL,
	created_at DATE NOT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (account_id)
		REFERENCES management.accounts(id)
)
