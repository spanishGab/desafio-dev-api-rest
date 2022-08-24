CREATE TABLE person (
	id INTEGER NOT NULL,
	name TEXT CHECK(LENGTH(name) <= 300) NOT NULL,
	document_number TEXT CHECK(LENGTH(document_number) = 11) UNIQUE NOT NULL,
	birth_date TEXT NOT NULL,

  	PRIMARY KEY(id)
);

CREATE TABLE account (
	id INTEGER NOT NULL,
	person_id INTEGER NOT NULL,
	balance NUMERIC NOT NULL DEFAULT 0,
	daily_withdrawal_limit NUMERIC DEFAULT 500,
	is_active BOOLEAN NOT NULL DEFAULT false,
	type TEXT CHECK(type IN ('corrente', 'poupanca', 'salario', 'conjunta')) NOT NULL DEFAULT 'corrente',
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY(id),
	FOREIGN KEY (person_id) REFERENCES person(id)
);

CREATE TABLE operation (
	id INTEGER NOT NULL,
	account_id INTEGER NOT NULL,
	amount NUMERIC NOT NULL,
	created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY(id),
	FOREIGN KEY (account_id) REFERENCES account(id)
);
