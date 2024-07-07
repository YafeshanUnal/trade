import { Model, DataTypes, Sequelize } from "sequelize";
import { getShareById } from "../share/share.database";
import { getWalletById } from "../wallet/wallet.database";
import TransactionTypes from "../enum/TransactionTypes";
import { BaseResponse } from "../global";

export class TransactionSell extends Model {
	public Id!: string;
	public WalletId!: string;
	public Name!: string;
	public Price!: number;
	public Rate!: number;
	public Type!: string;
}

const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING!);

TransactionSell.init(
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
			defaultValue: TransactionTypes.SELL,
		},
	},
	{
		tableName: "Transaction",
		sequelize,
		timestamps: false,
	}
);

export async function createSell(
	req: any
): Promise<BaseResponse<TransactionSell>> {
	try {
		const share = await getShareById(req.id);
		const wallet = await getWalletById(req.walletId);
		const name = share?.Id;
		const price = share?.Price[share.Price.length - 1] || 0;

		if (!share || !wallet) {
			return {
				statusCode: 400,
				message: "Invalid share or wallet",
				data: null,
			};
		}

		if (share.Value < req.rate) {
			return {
				statusCode: 400,
				message: "Insufficient shares",
				data: null,
			};
		}

		if (wallet.Shares === null || wallet.Shares.length === 0) {
			return {
				statusCode: 400,
				message: "No shares in wallet",
				data: null,
			};
		}

		let shares = wallet.Shares.map((share) =>
			JSON.parse(JSON.stringify(share))
		);

		const shareToUpdate = shares.find((share) => share.Name === name);

		if (shareToUpdate) {
			shareToUpdate.Rate -= req.rate;
		} else {
			return {
				statusCode: 400,
				message: "Share not found in wallet",
				data: null,
			};
		}
		if (shareToUpdate.Rate < req.rate) {
			return {
				statusCode: 400,
				message: "Insufficient shares in wallet",
				data: null,
			};
		}

		const transaction = await TransactionSell.create({
			WalletId: req.walletId,
			Name: name,
			Price: price,
			Rate: req.rate,
		});

		const amount = req.rate * price;
		wallet.TotalAccumulation =
			Number(wallet.TotalAccumulation) - Number(amount);
		wallet.Shares = shares.map((share) => JSON.parse(JSON.stringify(share)));
		await wallet.save();

		share.Value = Number(share.Value) - Number(req.rate);
		await share.save();

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
