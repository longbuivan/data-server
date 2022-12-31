const agg_mongo_pipeline = 
[
    {
        '$project': {
            '_id': 1,
            'viewableImpressionsCount': '$viewableImpressionsCount',
            'inviewImpressionsCount': '$inviewImpressionsCount',
            'differcent': {
                '$subtract': [
                    '$viewableImpressionsCount', '$inviewImpressionsCount'
                ]
            }
        }
    }, {
        '$match': {
            'differcent': {
                '$lt': 0
            }
        }
    }, {
        '$count': 'string'
    }
]
