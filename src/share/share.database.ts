import { Model, DataTypes, Sequelize } from "sequelize";
import dotenv from "dotenv";

class Share extends Model {
	public Id!: string;
	public Price!: number[];
	public Value!: number;
}
dotenv.config();
const connectionString = process.env.DB_CONNECTION_STRING;

const sequelize = new Sequelize(connectionString!);
Share.init(
	{
		Id: {
			primaryKey: true,
			type: DataTypes.STRING(3),
			allowNull: false,
			unique: true,
			validate: {
				is: /^[A-Z]{3}$/,
			},
		},
		Price: {
			type: DataTypes.ARRAY(DataTypes.DECIMAL(10, 2)),
			allowNull: false,
			validate: {},
		},
		Value: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
	},
	{
		tableName: "Share",
		sequelize,
		timestamps: false,
	}
);

export async function getShareById(Id: string): Promise<Share | null> {
	try {
		const share = await Share.findByPk(Id);
		console.log("Share", share);
		if (!share) {
			return null;
		}
		return share;
	} catch (error) {
		console.log("Error", error);
		return null;
	}
}

export async function updateSharePrices(): Promise<void> {
	try {
		console.log("Updating share prices");
		const shares = await Share.findAll();
		shares.forEach(async (share) => {
			const value = parseFloat((Math.random() * 100).toFixed(2));
			share.update({ Price: [...share.Price, value], Value: share.Value });
		});
	} catch (error) {
		console.log("Error", error);
	}
}
setInterval(updateSharePrices, 60 * 60 * 1000);
