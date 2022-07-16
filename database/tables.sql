CREATE TYPE ACCOUNT_TYPE AS ENUM ('corrente', 'poupanca', 'salario', 'conjunta')

CREATE TABLE payments.person (
	id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
	name VARCHAR(300) NOT NULL,
	document_number VARCHAR(11) NOT NULL,
	birth_date DATE NOT NULL,

	PRIMARY KEY (id)
)

CREATE TABLE payments.account (
	id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
	person_id BIGINT NOT NULL,
	balance MONEY NOT NULL,
	daily_withdrawal_limit MONEY,
	is_active BOOLEAN NOT NULL,
	type ACCOUNT_TYPE NOT NULL,
	creation_date TIMESTAMP NOT NULL,
	
	PRIMARY KEY(id),
	FOREIGN KEY (person_id)
		REFERENCES payments.person(id)
)

CREATE TABLE payments.transaction (
	id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY,
	account_id BIGINT NOT NULL,
	amount MONEY NOT NULL,
	creation_date DATE NOT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (account_id)
		REFERENCES payments.accounts(id)
)
