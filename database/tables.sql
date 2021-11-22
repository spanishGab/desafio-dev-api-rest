CREATE TABLE management.people (
	id_person INT NOT NULL GENERATED ALWAYS AS IDENTITY,
	name VARCHAR(300),
	cpf VARCHAR(11),
	birth_date DATE,
	
	PRIMARY KEY (id_person)
)

CREATE TABLE management.accounts (
	id_account INT NOT NULL GENERATED ALWAYS AS IDENTITY,
	id_person INT NOT NULL,
	balance MONEY,
	daily_withdrawal_limit MONEY,
	status BOOLEAN,
	type SMALLINT,
	created_at TIMESTAMP,
	
	PRIMARY KEY(id_account),
	FOREIGN KEY (id_person)
		REFERENCES management.people(id_person)
)

CREATE TABLE management.transactions (
	id_transaction INT NOT NULL GENERATED ALWAYS AS IDENTITY, --(COULD BE A BIGINT IF THIS WAS A REAL WORLD APPLICATION) 
	id_account INT NOT NULL,
	amount MONEY,
	transaction_date DATE,
	
	PRIMARY KEY (id_transaction),
	FOREIGN KEY (id_account)
		REFERENCES management.accounts(id_account)
	
)
