SELECT 
    oac_insurance.incuranec_code,
    oac_insurance.custom_id_fk,
    oac_insurance.company_id_fk,
    oac_insurance.agent_id_fk,
    oac_insurance_options.insurance_type_fk,
    oac_insurance.option_id_fk,
    oac_insurance.contract_number,
    oac_insurance.contract_start_date,
    oac_insurance.contract_end_date,
    DATEDIFF(CURDATE(), contract_end_date) AS day_contract,
    oac_insurance.contract_status,
    oac_insurance.status_check,
    oac_insurance.status_change,
    oac_insurance.create_date,
    oac_insurance.user_fname,
    oac_insurance.user_lname,
    oac_insurance.user_gender,
    oac_insurance.user_dob,
    oac_insurance.user_tel,
    oac_insurance.user_district_fk,
    DU.provice_fk AS user_province_id,
    oac_insurance.user_village,
    DU.district_name AS user_dist_name,
    PU.province_name AS user_prov_name,
    oac_type_insurance.type_in_name,
    oac_type_insurance.status_ins,
    oac_type_buyer.type_buyer_name,
    oac_insurance_options.options_name,
    oac_custom_buyer.custom_profile,
    oac_custom_buyer.customer_name,
    oac_custom_buyer.village_name,
    oac_custom_buyer.registra_tel,
    oac_custom_buyer.status_changs,
    oac_custom_buyer.type_buyer_fk,
    CD.district_name AS cut_district_ncme,
    CP.province_name AS cut_province_name,
    oac_action_insurance.actionId,
    oac_action_insurance.initial_fee,
    oac_action_insurance.percent_taxes,
    oac_action_insurance.money_taxes,
    oac_action_insurance.registration_fee,
    oac_action_insurance.insuranc_included,
    oac_action_insurance.precent_incom,
    oac_action_insurance.pre_tax_profit,
    oac_action_insurance.percent_akorn,
    oac_action_insurance.incom_money,
    oac_action_insurance.incom_finally,
    oac_action_insurance.percent_eps,
    oac_action_insurance.pays_advance_fee,
    oac_action_insurance.percent_fee_eps,
    oac_action_insurance.money_percent_fee,
    oac_action_insurance.expences_pays_taxes,
    oac_action_insurance.net_income,
    oac_action_insurance.status_company,
    oac_action_insurance.company_date,
		oac_action_insurance.currency_id_fk,
    DATEDIFF(CURDATE(), oac_action_insurance.company_date) AS day_company,
    oac_action_insurance.status_agent,
    oac_action_insurance.agent_date,
    DATEDIFF(CURDATE(), oac_action_insurance.agent_date) AS day_agent,
    oac_action_insurance.status_oac,
    oac_action_insurance.oac_date,
    DATEDIFF(CURDATE(), oac_action_insurance.oac_date) AS day_oac,
    oac_agent_sale.idcrad_code,
    oac_agent_sale.agent_name,
    oac_agent_sale.agent_dob,
    oac_agent_sale.district_id_fk,
    oac_agent_sale.agent_village,
    oac_agent_sale.agent_tel,
    oac_agent_sale.agent_status,
    oac_district.provice_fk,
    oac_district.district_name,
    oac_province.province_name,
    oac_company.com_logo,
    oac_company.com_name_lao,
    oac_company.com_name_eng,
    oac_company.com_tel,
    oac_company.com_address,
    oac_cars_insurance.car_registration,
    oac_cars_insurance.vehicle_number,
    oac_cars_insurance.tank_number,
    oac_cars_insurance.car_type_id_fk,
    oac_cars_insurance.car_brand_id_fk,
    oac_cars_insurance.version_name,
		currency_name,
		genus,
		reate_price
FROM oac_insurance 
LEFT JOIN oac_custom_buyer ON oac_insurance.custom_id_fk = oac_custom_buyer.custom_uuid
LEFT JOIN oac_action_insurance ON oac_insurance.incuranec_code = oac_action_insurance.contract_code_fk
LEFT JOIN oac_insurance_options ON oac_insurance.option_id_fk = oac_insurance_options.options_Id
LEFT JOIN oac_type_insurance ON oac_insurance_options.insurance_type_fk = oac_type_insurance.type_insid
LEFT JOIN oac_agent_sale ON oac_insurance.agent_id_fk = oac_agent_sale.agent_Id
LEFT JOIN oac_district ON oac_agent_sale.district_id_fk = oac_district.district_id
LEFT JOIN oac_province ON oac_district.provice_fk = oac_province.province_id
LEFT JOIN oac_company ON oac_insurance.company_id_fk = oac_company.company_Id 
LEFT JOIN oac_type_buyer ON oac_custom_buyer.type_buyer_fk = oac_type_buyer.type_buyer_id 
LEFT JOIN oac_cars_insurance ON oac_insurance.incuranec_code = oac_cars_insurance.contract_id_fk 
LEFT JOIN oac_district AS DU ON oac_insurance.user_district_fk = DU.district_id
LEFT JOIN oac_province AS PU ON DU.provice_fk = PU.province_id 
LEFT JOIN oac_district AS CD ON oac_custom_buyer.district_fk = CD.district_id
LEFT JOIN oac_province AS CP ON CD.provice_fk = CP.province_id 
LEFT JOIN oac_currency ON oac_action_insurance.currency_id_fk = oac_currency.currency_id 