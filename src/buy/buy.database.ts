import { Model, DataTypes, Sequelize } from "sequelize";
import { getShareById } from "../share/share.database";
import { Wallet, getWalletById } from "../wallet/wallet.database";
import TransactionTypes from "../enum/TransactionTypes";
import { BaseResponse } from "../global";
import { totalShares } from "../stock/stock.database";

export class Transaction extends Model {
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

export async function createBuy(req: any): Promise<BaseResponse<Transaction>> {
	try {
		const share = await getShareById(req.id);
		const wallet = await getWalletById(req.walletId);
		const stock = await totalShares(req);
		const name = share?.Id;
		const price = share?.Price[share.Price.length - 1] || 0;

		if (!share || !wallet) {
			return {
				statusCode: 400,
				message: "Invalid share or wallet",
				data: null,
			};
		}
		console.log("req.rate", req.rate);
		console.log("stock", stock);
		if (req.rate > stock) {
			return {
				statusCode: 400,
				message: "You have reached the maximum limit of shares",
				data: null,
			};
		}

		const transaction = await Transaction.create({
			WalletId: req.walletId,
			Name: name,
			Price: price,
			Rate: req.rate,
		});

		const amount = req.rate * price;

		if (wallet.Shares === null || wallet.Shares.length === 0) {
			if (name) {
				wallet.Shares = [{ Name: name, Rate: req.rate }];
			}
		} else {
			let shares = wallet.Shares.map((share) =>
				JSON.parse(JSON.stringify(share))
			);

			const shareToUpdate = shares.find((share) => share.Name === name);

			if (shareToUpdate) {
				shareToUpdate.Rate += req.rate;
			} else {
				if (name) {
					shares.push({ Name: name, Rate: req.rate });
				}
			}
			wallet.Shares = shares.map((share) => share);
		}

		await wallet.update({
			Shares: wallet.Shares,
			TotalAccumulation: Number(wallet.TotalAccumulation) + Number(amount),
		});

		share.update({
			Value: share.Value - req.rate,
		});

		return {
			statusCode: 200,
			message: "Transaction successfully created",
			data: transaction,
		};
	} catch (error) {
		console.error("Failed to create transaction", error);
		return {
			statusCode: 500,
			message: "Failed to create transaction",
			data: null,
		};
	}
}
