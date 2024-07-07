import { Model, DataTypes, Sequelize } from "sequelize";
import { getShareById } from "../share/share.database";
import { getWalletById } from "../wallet/wallet.database";
import TransactionTypes from "../enum/TransactionTypes";
import { BaseResponse } from "../global";

class Transaction extends Model {
	public Id!: string;
	public WalletId!: string;
	public Name!: string;
	public Price!: number;
	public Rate!: number;
	public Type!: string;
}

const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING!);

Transaction.init(
	{
		Id: {
			primaryKey: true,
			type: DataTypes.BIGINT,
			allowNull: false,
			autoIncrement: true,
		},
		WalletId: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		Name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		Price: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		Rate: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		Type: {
			type: DataTypes.SMALLINT,
			allowNull: false,
			defaultValue: TransactionTypes.BUY,
		},
	},
	{
		tableName: "Transaction",
		sequelize,
		timestamps: false,
	}
);

export async function totalShares(req: any): Promise<Number> {
	try {
		const totalBought = await Transaction.sum("Rate", {
			where: {
				Name: req.id,
				Type: TransactionTypes.BUY,
			},
		});
		const totalSold = await Transaction.sum("Rate", {
			where: {
				Name: req.id,
				Type: TransactionTypes.SELL,
			},
		});
		const totalShares = totalBought - totalSold;
		return totalShares;
	} catch (error) {
		console.log("Error", error);
		return 0;
	}
}
