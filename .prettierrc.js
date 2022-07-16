module.exports = {
	singleQuote: true,
	trailingComma: 'all',
	useTabs: false,
	tabWidth: 2,
	printWidth: 80,
	overrides: [
		{
			files: '*.ts',
			options: {
				parser: 'typescript',
			},
		},
	],
};
