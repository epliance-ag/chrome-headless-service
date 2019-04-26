#!/bin/bash

#wait until container booted
MAXSLEEP=60
SLEEPCNT=0
curl http://127.0.0.1:8888/health &>/dev/null
res=$?
until [ "$res" -eq 0 ] || [ "$SLEEPCNT" -eq "$MAXSLEEP" ]
do
    sleep 1
    SLEEPCNT=$(($SLEEPCNT+1))
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

echo -n '{"files":{"html":"' > test.json
base64 -w0 testhtml/headerfooter.html >> test.json
echo -n '","header":"' >> test.json
base64 -w0 testhtml/header.html >> test.json
echo -n '","footer":"' >> test.json
base64 -w0 testhtml/footer.html >> test.json
echo -n '"}}' >> test.json
curl -XPOST --connect-timeout 600 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888 --output result/headerfooter.pdf
if [ $? -ne 0 ]; then
    echo "could not create headerfooter";
    exit 1;
fi
./diff.sh reference/headerfooter.pdf result/headerfooter.pdf
if [ $? -ne 0 ]; then
    echo "headerfooter differs";
    exit 1;
fi

echo -n '{"files":{"html":"' > test.json
base64 -w0 testhtml/headerfooter.html >> test.json
echo -n '","header":""' >> test.json
echo -n ',"footer":"' >> test.json
base64 -w0 testhtml/footer.html >> test.json
echo -n '"}}' >> test.json
curl -XPOST --connect-timeout 600 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888 --output result/onlyfooter.pdf
if [ $? -ne 0 ]; then
    echo "could not create onlyfooter";
    exit 1;
fi
./diff.sh reference/onlyfooter.pdf result/onlyfooter.pdf
if [ $? -ne 0 ]; then
    echo "onlyfooter differs";
    exit 1;
fi

echo -n '{"files":[{"html":"' > test.json
base64 -w0 testhtml/headerfooter.html >> test.json
echo -n '","header":"' >> test.json
base64 -w0 testhtml/header.html >> test.json
echo -n '","footer":"' >> test.json
base64 -w0 testhtml/footer.html >> test.json
echo -n '"},' >> test.json
echo -n '{"html":"' >> test.json
base64 -w0 testhtml/headerfooter.html >> test.json
echo -n '","header":"' >> test.json
base64 -w0 testhtml/header.html >> test.json
echo -n '","footer":"' >> test.json
base64 -w0 testhtml/footer.html >> test.json
echo -n '"}]}' >> test.json
curl -XPOST --connect-timeout 600 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888 --output result/mergeheaderfooter.pdf
if [ $? -ne 0 ]; then
    echo "could not create merge headerfooter";
    exit 1;
fi
./diff.sh reference/mergeheaderfooter.pdf result/mergeheaderfooter.pdf
if [ $? -ne 0 ]; then
    echo "mergeheaderfooter differs";
    exit 1;
fi

echo -n '{"files":{"html":"' > test.json
base64 -w0 testhtml/stripjs.html >> test.json
echo -n '","header":"' >> test.json
base64 -w0 testhtml/stripjsheader.html >> test.json
echo -n '"}}' >> test.json
curl -XPOST --connect-timeout 600 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888 --output result/stripjsheader.pdf
if [ $? -ne 0 ]; then
    echo "could not create stripjsheader";
    exit 1;
fi
./diff.sh reference/stripjsheader.pdf result/stripjsheader.pdf
if [ $? -ne 0 ]; then
    echo "stripjsheader differs";
    exit 1;
fi

echo -n '{"files":"' > test.json
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

echo -n '{"options": {"landscape":true}, "files":"' > test.json
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

echo -n '{"options": {"width":337,"height":1337}, "files":"' > test.json
base64 -w0 testhtml/simplepage.html >> test.json
echo -n '"}' >> test.json
curl -XPOST --connect-timeout 1200 -H "Content-Type: application/json" -d @test.json http://127.0.0.1:8888/screenshot --output result/screenshot.png
if [ $? -ne 0 ]; then
    echo "could not create screenshot";
    exit 1;
fi
diff result/screenshot.png reference/screenshot.png
if [ $? -ne 0 ]; then
    md5sum result/screenshot.png
    ls -l result/screenshot.png
    head -n3 reference/screenshot.png
    tail -n3 reference/screenshot.png
    echo "screenshot differs";
    exit 1;
fi