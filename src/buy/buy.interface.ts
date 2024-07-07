class Buy extends Model {
	public id!: number;
	public name!: string;
	public price!: number;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;
}
