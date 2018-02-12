#!/bin/bash

echo -n '{"html":"' > test.json
base64 -w0 testhtml/simplepage.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 600 -H "Content-Type: application/json" -d @test.json http://localhost:8888 --output result/simplepage.pdf

echo -n '{"landscape":true, "html":"' > test.json
base64 -w0 testhtml/simplepage.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 1200 -H "Content-Type: application/json" -d @test.json http://localhost:8888 --output result/simplepagelandscape.pdf

echo -n '{"html":"' > test.json
base64 -w0 testhtml/hugetable.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 1200 -H "Content-Type: application/json" -d @test.json http://localhost:8888 --output result/hugetable.pdf

echo -n '{"html":"' > test.json
base64 -w0 testhtml/hugetext.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 1200 -H "Content-Type: application/json" -d @test.json http://localhost:8888 --output result/hugetext.pdf


