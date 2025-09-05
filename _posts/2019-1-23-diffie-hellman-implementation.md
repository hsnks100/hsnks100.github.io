---
toc: true
tags: [c++, cryptography, diffie-hellman, algorithm]
---

# Diffie-Hellman 키 교환 구현

Diffie-Hellman 키 교환 알고리즘을 C++로 구현해보자. 이 알고리즘은 두 당사자가 공개 채널을 통해 비밀 키를 안전하게 공유할 수 있게 해주는 암호학적 프로토콜이다.

## C++ version

```cpp
// The biggest 64bit prime

#define P 0xffffffffffffffc5ull
#define G 5

#include <cmath>
#include <inttypes.h>
#include <cstdlib>
// calc a * b % p , avoid 64bit overflow
uint64_t mul_mod_p(uint64_t a, uint64_t b) {
	uint64_t m = 0;
	while(b) {
		if(b&1) {
			uint64_t t = P-a;
			if ( m >= t) {
				m -= t;
			} else {
				m += a;
			}
		}
		if (a >= P - a) {
			a = a * 2 - P;
		} else {
			a = a * 2;
		}
		b>>=1;
	}
	return m;
}

uint64_t pow_mod_p(uint64_t a, uint64_t b) {
	if (b==1) {
		return a;
	}
	uint64_t t = pow_mod_p(a, b>>1);
	t = mul_mod_p(t,t);
	if (b % 2) {
		t = mul_mod_p(t, a);
	}
	return t;
}

// calc a^b % p
uint64_t powmodp(uint64_t a, uint64_t b) {
	if (a > P)
		a%=P;
	return pow_mod_p(a,b);
}

uint64_t randomint64() {
	uint64_t a = rand();
	uint64_t b = rand();
	uint64_t c = rand();
	uint64_t d = rand();
	return a << 48 | b << 32 | c << 16 | d;
}

void test() {
	uint64_t a = randomint64();
	uint64_t b = randomint64();
	uint64_t A = powmodp(G, a);
	uint64_t B = powmodp(G, b);
	uint64_t secret1 = powmodp(B,a);
	uint64_t secret2 = powmodp(A,b);
	assert(secret1 == secret2);
    std::cout << "a=" << a << ", b=" << b << ", s1=" << secret1 << ", s2=" << secret2 << std::endl;
	//printf("a=%I64x b=%I64x\n s1=%I64x s2=%I64x\n", a,b,secret1, secret2);
    printf("\n");
}

int main(int argc, char **argv)
{ 
    for(int i=0; i<100000; i++) {
        test();
    }
}
```


# c++ boost cpp_int version
...
# java version
```java
        BigInteger primeValue = BigInteger.valueOf(36854777731L);
        BigInteger generatorValue	= BigInteger.valueOf(5L);
        BigInteger phonePrivateKey = BigInteger.valueOf(43214321L);
        BigInteger phonePublicKey = generatorValue.modPow(phonePrivateKey, primeValue);
        BigInteger publicRobot = null;
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("public_key", phonePublicKey.longValue());
            sendToRobotUsingBLE(SocketTool.REQ_USERKEY, jsonObject.toString());
        } catch (JSONException e) {
            e.printStackTrace();
        }
        
	BigInteger primeValue = BigInteger.valueOf(36854777731L);
	BigInteger generatorValue	= BigInteger.valueOf(5L);
	BigInteger phonePrivateKey = BigInteger.valueOf(43214321L);
	BigInteger publicRobot = null;
	try {
	    publicRobot = BigInteger.valueOf(mBLEPacket.mJsonObject.getLong("public_key"));
	    BigInteger secretKey = publicRobot.modPow(phonePrivateKey, primeValue);

	    Log.i("secretKey", "same secretKey: " + secretKey.toString());
	    sendToRobotUsingBLE(SocketTool.REQ_SCAN_WIFI, "{}");
	} catch (JSONException e) {
	    e.printStackTrace();
	}
```
