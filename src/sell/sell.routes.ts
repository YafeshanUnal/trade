import express, { response } from "express";
import bodyParser from "body-parser";
import * as database from "./sell.database";
export const sellRouter = express.Router();

sellRouter.use(bodyParser.json());

sellRouter.post("/sell", async (req, res) => {
	const { id, walletId } = req.body;
	try {
		if (!id || !walletId) {
			return res
				.status(400)
				.json({ error: `Please provide all the required parameters..` });
		}
		const response = await database.createSell(req.body);
		if (response !== null) {
			res.status(200).json(response);
		} else {
			res.status(400).json({ success: false, message: "Failed to create buy" });
		}
	} catch (error) {
		return res.status(500).json({ error });
	}
});
