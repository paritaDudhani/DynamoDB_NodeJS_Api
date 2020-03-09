const AWS = require('aws-sdk');
const uuid = require('uuid');
const config = require('../../../config/config');
const express = require('express');
// const app = express();
const router = express.Router();

router.get('/', (req, res, next) => {
    AWS.config.update(config.aws_local_config);
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: "Country",
    }

    docClient.scan(params, function (err, data) {
        if (err) {
            res.send({
                success: false,
                message: err.message
            });
        } else {
            const { Items } = data;
            res.send({
                success: true,
                country: Items
            });
        }
    });
});

router.get('/:id', (req, res, next) => {
    AWS.config.update(config.aws_local_config);

    const id = req.params.id;
    console.log(id);
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: config.aws_table_name,
        KeyConditionExpression: 'id = :i',
        ExpressionAttributeValues: {
            ':i': id
        }
    };

    docClient.query(params, (err, data) => {
        if (err) {
            res.send({
                success: false,
                message: 'Server Error'
            });
        } else {
            console.log('data of given id: ', data);
            if (data.Count === 0) {
                return res.send({
                    success: false,
                    message: 'No country wih given id found'
                });
            }
            const { Items } = data;
            res.send({
                success: true,
                Country: Items[0]
            });
        }
    });
});

router.post('/', (req, res, next) => {

    const id = uuid.v4();
    AWS.config.update(config.aws_local_config);
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: "Country",
        Item: {
            id: id,
            countryName: req.body.countryName
        }
    }

    docClient.put(params, function (err, data) {
        if (err) {
            res.send({
                success: false,
                message: err.message
            });
        } else {
            res.send({
                success: true,
                message: 'Country added successfully',
                id: id
            });
        }
    });
});

router.patch('/:id', (req, res, next) => {
    AWS.config.update(config.aws_local_config);
    const id = req.params.id;
    const countryName = req.body.name;
    const docClient = new AWS.DynamoDB.DocumentClient();
    const param = {
        TableName: config.aws_table_name,
        Key: {
            id: id
        },
        UpdateExpression: "set countryName = :cn",
        ExpressionAttributeValues: {
            ":cn": countryName
        }
    }

    const params = {
        TableName: config.aws_table_name,
        KeyConditionExpression: 'id = :i',
        ExpressionAttributeValues: {
            ':i': id
        }
    }

    docClient.query(params, function (err, data) {
        if (err) {
            return res.send({
                success: false,
                message: 'Server Error'
            });
        }
        if (!data.Count) {
            return res.send({
                success: false,
                message: 'No such country found'
            });
        }
        countryUpdate(data, param, docClient)
            .then(res.send)
            .catch(res.send)


    });
});

function countryUpdate(data, param, docClient) {
    return new Promise((resolve, reject) => {

        docClient.update(param, (err, res) => {
            if (err) {
                reject({
                    success: false,
                    message: 'Server Error'
                })
            } else {
                console.log(data)
                resolve({
                    success: true,
                    message: 'Country updated!!',
                    Country: data.Items[0]
                })
            }
        })
    })
}

router.delete('/:id', (req, res, next) => {
    AWS.config.update(config.aws_local_config);
    const id = req.params.id;
    const docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: config.aws_table_name,
        KeyConditionExpression: 'id = :i',
        ExpressionAttributeValues: {
            ':i': id
        }
    }
    const param = {
        TableName: config.aws_table_name,
        Key: {
            id: id
        }
    }

    docClient.query(params, (err, data) => {
        if (err) {
            return res.send({
                success: false,
                message: err.message
            });
        }
        if (!data.Count) {
            return res.send({
                success: false,
                message: 'No such country found'
            });
        }
        countryDelete(param, docClient)
            .then(result => res.send(result))
            .catch(e => res.send(e))
    });
});

function countryDelete(param, docClient) {
    return new Promise((resolve, reject) => {
        docClient.delete(param, (err, res) => {
            if (err) {
                reject({
                    success: false,
                    message: 'Server Error'
                })
            } else {
                resolve({
                    success: true,
                    message: 'Country deleted!!',
                })
            }
        })
    })
}


module.exports = router;