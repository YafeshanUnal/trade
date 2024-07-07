import { Model, DataTypes, Sequelize } from "sequelize";

export class Wallet extends Model {
	public Id!: string;
	public TotalAccumulation!: number;
	public Shares!: { Name: string; Rate: number }[];
}

const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING!);

Wallet.init(
	{
		Id: {
			primaryKey: true,
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		TotalAccumulation: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		Shares: {
			type: DataTypes.ARRAY(DataTypes.JSONB),
			allowNull: false,
		},
	},
	{
		tableName: "Wallet",
		sequelize,
		timestamps: false,
	}
);

export async function getWalletById(walletId: string): Promise<Wallet | null> {
	try {
		const wallet = await Wallet.findByPk(walletId);
		console.log("Wallet", wallet);
		if (!wallet) {
			return null;
		}
		return wallet;
	} catch (error) {
		console.log("Error", error);
		return null;
	}
}
