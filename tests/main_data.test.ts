import { describe, it } from "mocha";

import assert from "assert";

import type { QueryParamsType, GenericJson } from "../data/types";

import { mainDataQuery } from '../data/engine';

describe("main_data", () => {

    const releasedMetrics: GenericJson = {
        "newCasesByPublishDate": "int",
        "femaleCases":"list",
        "maleCases":"list"
    };

    const resultsStructure: GenericJson = {
        "date": "date",
        "areaType": "areaType",
        "areaCode": "areaCode",
        "areaName": "areaName" ,
        "metric": "metric",
        "age": "age",
        "value": "value",
        "rate": "rate"
    };

    const releaseDate = "2020-11-20T00:00:00.000Z";
    const metrics = "newCasesByPublishDate,femaleCases,maleCases";

    const queryParams: QueryParamsType = {
        areaType: "nation",
        areaCode: "E92000001",
        release: releaseDate,
        metric: metrics,
        format: "json"
    };  

    describe('#mainDataQuery', () => {

        it('JSON integrity', async () => {

            queryParams["format"] = "json";
        
            const jsonData =  await mainDataQuery(queryParams, releasedMetrics);
                      
            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);

            const json = JSON.parse(jsonData.body);
            assert.strictEqual("length" in json, true);
            assert.strictEqual("body" in  json, true);

            const max_response_date = Math.max(...json.body.map((e: GenericJson) => new Date(e.date).getTime()));
            assert.strictEqual (max_response_date <= new Date(releaseDate).getTime(), true);
 
            assert.strictEqual(json.length > 10, true);

        });

    });

    describe('#mainDataQuery', () => {

        it('CSV integrity', async () => {

            queryParams["format"] = "csv";
        
            const csvData =  await mainDataQuery(queryParams, releasedMetrics);

            assert.strictEqual(typeof csvData, "object");
            assert.strictEqual("body" in csvData, true);
            assert.strictEqual("headers" in csvData, true);
            assert.strictEqual(typeof csvData.body, "string");

            const arr = csvData.body.split("\n").slice(1);
            const max_response_date = Math.max(...arr.map((e: string) => new Date(e.split(",")[0]).getTime()));
            assert.strictEqual (max_response_date <= new Date(releaseDate).getTime(), true);

            assert.strictEqual(
                csvData.body.split("\n").length > 10,
                true
            );

            assert.strictEqual(
                csvData
                    .body
                    .split("\n")[0]
                    .trim(),
                Object.keys(resultsStructure)
                    .join(","),
            );

        });

    });

    describe('#mainDataQuery', () => {

        
        it('JSONL integrity', async () => {

            queryParams["format"] = "jsonl";
        
            const jsonlData =  await mainDataQuery(queryParams, releasedMetrics);

            assert.strictEqual(typeof jsonlData, "object");
            assert.strictEqual("body" in jsonlData, true);
            assert.strictEqual("headers" in jsonlData, true);

            assert.strictEqual(typeof jsonlData.body, "string");

            assert.strictEqual(
                jsonlData.body.split("\n").length > 10,
                true
            );
           
            const arr = jsonlData.body.split("\n").slice(1);
            const max_response_date = Math.max(...arr.map((e: string) => new Date((JSON.parse(e)).date).getTime()));
            assert.strictEqual (max_response_date <= new Date(releaseDate).getTime(), true)

        });

    });


});