SELECT count(*) FROM [cimc_records].[dbo].[patients] 
JOIN [cimc_records].[dbo].[patients_info] AS [info]
on [info].[patient_id] = [patients].[id]
where [info].[sex] = 'male'