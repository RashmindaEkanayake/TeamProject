import test from 'node:test';
import assert from 'node:assert/strict';
import {csvCell,csvRow,businessCSV,sumMoney} from '../test-build/csv.js';
test('CSV escapes commas, quotes and line breaks',()=>assert.equal(csvCell('A,"B"\nC'),'"A,""B""\nC"'));
test('CSV formula values including whitespace are neutralized',()=>{for(const value of ['=1+1','+SUM(A1)','-1+2','@SUM(A1)','\t=2','  =3'])assert.equal(csvCell(value),`"'${value}"`);});
test('CSV nulls and zero are preserved',()=>assert.equal(csvRow([null,0]),'"","0"\r\n'));
test('Decimal totals use integer cents',()=>assert.equal(sumMoney([0.1,0.2]),0.3));
test('Business export includes real escaped data',()=>{const data=businessCSV([{invoiceNum:'INV-1',customer:{shopName:'=formula'},orderStatus:'APPROVED',orderedDate:'2026-10-04',totalAmount:12.3}],[]);assert.match(data,/"'\=formula"/);assert.match(data,/"12.30"/);});
