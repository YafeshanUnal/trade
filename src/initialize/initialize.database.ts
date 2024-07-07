import { Model, DataTypes, Sequelize, UUID } from "sequelize";
import { Wallet } from "../wallet/wallet.database";
import { Transaction } from "../buy/buy.database";
import { TransactionSell } from "../sell/sell.database";
import TransactionTypes from "../enum/TransactionTypes";
async function initializeDatabase() {
	console.log("Initializing database...");
	for (let i = 0; i < 5; i++) {
		console.log("Creating wallet...");
		const values = ["VGA", "KEH", "AGH"];
		const data = values.map((name) => ({
			Name: name,
			Rate: Math.floor(Math.random() * 10) + 1, // Generate a random number between 1 and 10
		}));
		await Wallet.create({
			TotalAccumulation: 1000,
			Shares: [
				{
					Name: values[Math.floor(Math.random() * 3)],
					Rate: Math.floor(Math.random() * 10) + 1,
				},
			],
		});

		Transaction.create({
			WalletId: "eb60c097-84d1-4f19-8afb-b01505da3f57",
			Name: values[Math.floor(Math.random() * 3)],
			Price: Math.floor(Math.random() * 100) + 1,
			Rate: Math.floor(Math.random() * 10) + 1,
			Type: TransactionTypes.BUY,
		});
		TransactionSell.create({
			WalletId: "eb60c097-84d1-4f19-8afb-b01505da3f57",
			Name: values[Math.floor(Math.random() * 3)],
			Price: Math.floor(Math.random() * 100) + 1,
			Rate: Math.floor(Math.random() * 10) + 1,
			Type: TransactionTypes.SELL,
		});
	}
}

initializeDatabase();

export { initializeDatabase };
