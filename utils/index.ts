import { Model, ModelStatic, Transaction, Op } from "sequelize";
export function url() {
  return 'http://localhost:8899/image'; // no need to be async
  // return 'https://oac-api.viengkham-gold.com/image'; // no need to be async
}

const defaultNumericId = () => Number(`${new Date().getFullYear()}001`);

export const maxid = async (
  model: ModelStatic<Model>,
  field: string,
  transaction?: Transaction
): Promise<number> => {
  const currentMax = await model.max(field, { transaction });
  const numericMax = Number(currentMax);
  return Number.isFinite(numericMax) && numericMax > 0 ? numericMax + 1 : defaultNumericId();
};

export const maxCode = async (
  model: ModelStatic<Model>,
  field: string,
  prefix: string,
  transaction?: Transaction
): Promise<string> => {
  const latest = await model.findOne({
    attributes: [field],
    where: {
      [field]: {
        [Op.like]: `${prefix}%`,
      },
    } as any,
    order: [[field, "DESC"]],
    transaction,
    raw: true,
  });
  const value = latest ? String((latest as any)[field] || "") : "";
  const numberPart = Number(value.replace(prefix, ""));
  const nextNumber = Number.isFinite(numberPart) && numberPart > 0 ? numberPart + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
};
