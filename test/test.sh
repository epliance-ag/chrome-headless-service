#!/bin/bash

#wait until container booted
SLEEPMAX=20
SLEEPCNT=0
curl http://127.0.0.1:8888/health &>/dev/null
res=$?
until [ $res -eq 0 ] || [ $SLEEPCNT -eq $MAXSLEEP ]
do
    sleep 1
    SLEEPCNT=$SLEEPCNT+1
    curl http://127.0.0.1:8888/health &>/dev/null
    res=$?
done

mkdir -p result

echo -n '{"html":"' > test.json
base64 -w0 testhtml/simplepage.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 600 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888 --output result/simplepage.pdf
if [ $? -ne 0 ]; then
    echo "could not create simplepage";
    exit 1;
fi
./diff.sh reference/simplepage.pdf result/simplepage.pdf
if [ $? -ne 0 ]; then
    echo "simplepage differs";
    exit 1;
fi

echo -n '{"html":"' > test.json
base64 -w0 testhtml/stripjs.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 600 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888 --output result/stripjs.pdf
if [ $? -ne 0 ]; then
    echo "could not create stripjs";
    exit 1;
fi
./diff.sh reference/stripjs.pdf result/stripjs.pdf
if [ $? -ne 0 ]; then
    echo "stripjs differs";
    exit 1;
fi

echo -n '{"landscape":true, "html":"' > test.json
base64 -w0 testhtml/simplepage.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 1200 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888 --output result/simplepagelandscape.pdf
if [ $? -ne 0 ]; then
    echo "could not create simplepagelandscape";
    exit 1;
fi
./diff.sh reference/simplepagelandscape.pdf result/simplepagelandscape.pdf
if [ $? -ne 0 ]; then
    echo "simplepagelandscape differs";
    exit 1;
fi

echo -n '{"html":"' > test.json
base64 -w0 testhtml/hugetable.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 1200 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888 --output result/hugetable.pdf
if [ $? -ne 0 ]; then
    echo "could not create hugetable";
    exit 1;
fi
./diff.sh reference/hugetable.pdf result/hugetable.pdf
if [ $? -ne 0 ]; then
    echo "hugetable differs";
    exit 1;
fi

echo -n '{"html":"' > test.json
base64 -w0 testhtml/hugetext.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 1200 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888 --output result/hugetext.pdf
if [ $? -ne 0 ]; then
    echo "could not create hugetext";
    exit 1;
fi
./diff.sh reference/hugetext.pdf result/hugetext.pdf
if [ $? -ne 0 ]; then
    echo "hugetext differs";
    exit 1;
fi
