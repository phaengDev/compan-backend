/** query string ຂອງ endpoint ທີ່ສົ່ງເປັນລາຍການ: ?limit=&skip=&orderBy=&order= */
export interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}

/** ອ່ານ limit/skip/orderBy/order (ຄ່າເລີ່ມຕົ້ນ limit 100, skip 0, order ASC) */
export const getPagination = (query: QueryParams, defaultOrderBy: string) => {
    const limit = query.limit ? parseInt(query.limit, 10) : 100;
    const skip = query.skip ? parseInt(query.skip, 10) : 0;
    const orderBy = query.orderBy || defaultOrderBy;
    const order = (query.order || "ASC").toUpperCase() as "ASC" | "DESC";
    return { limit, skip, orderBy, order };
};
