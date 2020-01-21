---
tags: [aes, java, cpp]
layout: posts
---
# aes-java-cpp

A document describing how aes algorithm is compatible with c++ and java.

c++ side used cryptopp library which is is a free C++ class library of cryptographic schemes.

cryptopp supports AES, DES, SEED, BASE64/32 and so on.

java side used Cipher in java's default libraries. The encrypt key of this examples is "A"*16(They are the same.)

I hope it will help you used AES in C++, java.

c++ side

```cpp
#include <cryptopp/base64.h>
#include <cryptopp/aes.h>        
#include <cryptopp/seed.h>
#include <cryptopp/des.h>
#include <cryptopp/modes.h>      
#include <cryptopp/filters.h>
template <class TyMode>
std::string Encrypt(TyMode &Encryptor, const std::string &PlainText)
{
	std::string EncodedText;

	try {
		CryptoPP::StringSource(PlainText, true,
			new CryptoPP::StreamTransformationFilter(Encryptor,
				//new CryptoPP::Base64Encoder(
					new CryptoPP::StringSink(EncodedText)
                    //, false
					//),
                ,CryptoPP::BlockPaddingSchemeDef::PKCS_PADDING
				)
			);
	}
	catch (...) {}

	return EncodedText;
}

template <class TyMode>
std::string Decrypt(TyMode &Decryptor, const std::string &EncodedText)
{
	std::string RecoveredText;

	try {
		CryptoPP::StringSource(EncodedText, true,
			//new CryptoPP::Base64Decoder(
				new CryptoPP::StreamTransformationFilter(Decryptor,
					new CryptoPP::StringSink(RecoveredText),
					CryptoPP::BlockPaddingSchemeDef::PKCS_PADDING
					)
				//)
			);
	}
	catch (...) {}

	return RecoveredText;
}

template <class Ty>
std::string CBC_Encrypt(uint8_t *KEY, uint8_t *IV, const std::string &PlainText)
{
	typename CryptoPP::CBC_Mode<Ty>::Encryption Encryptor(KEY, Ty::DEFAULT_KEYLENGTH, IV);
	return Encrypt(Encryptor, PlainText);
}


template <class Ty>
std::string CBC_Decrypt(uint8_t *KEY, uint8_t *IV, const std::string &PlainText)
{
	typename CryptoPP::CBC_Mode<Ty>::Decryption Decryptor(KEY, Ty::DEFAULT_KEYLENGTH, IV);
	return Decrypt(Decryptor, PlainText);
}

template <class Ty>
std::string ECB_Encrypt(uint8_t *KEY, const std::string &PlainText)
{
	typename CryptoPP::ECB_Mode<Ty>::Encryption Encryptor(KEY, Ty::DEFAULT_KEYLENGTH);
	return Encrypt(Encryptor, PlainText);
}


template <class Ty>
std::string ECB_Decrypt(uint8_t *KEY, const std::string &PlainText)
{
	typename CryptoPP::ECB_Mode<Ty>::Decryption Decryptor(KEY, Ty::DEFAULT_KEYLENGTH);
	return Decrypt(Decryptor, PlainText);
}


template <class CryptoType>
void Test()
{
	using namespace std;

	const std::string sText = "Plain Text";
	std::string sEnc, sDec;

	uint8_t KEY[CryptoType::DEFAULT_KEYLENGTH];
    for(int i=0; i<CryptoType::DEFAULT_KEYLENGTH; i++) {
        KEY[i] = 'A';
    }
	uint8_t IV[CryptoType::BLOCKSIZE] = { 0x01, };

	// CBC 모드
	sEnc = CBC_Encrypt<CryptoType>(KEY, IV, sText);
	sDec = CBC_Decrypt<CryptoType>(KEY, IV, sEnc);

	cout << CryptoType::StaticAlgorithmName() << " : " << "CBC_MODE" << endl;
	//cout << sText << "\n -> " << sEnc << "\n -> " << sDec << endl;
    for(int i=0; i<sEnc.size(); i++) {
        printf("%x \n", sEnc[i] & 0xff);
    }
	cout << endl;


	// ECB 모드
	sEnc = ECB_Encrypt<CryptoType>(KEY, sText);
	sDec = ECB_Decrypt<CryptoType>(KEY, sEnc);

	cout << CryptoType::StaticAlgorithmName() << " : " << "ECB_MODE" << endl;
	cout << sText << "\n -> " << sEnc << "\n -> " << sDec << endl;
	cout << endl;
    for(int i=0; i<sEnc.size(); i++) {
        printf("%x \n", (uint8_t)sEnc[i] & 0xff);
    }
}


int main()
{
	using namespace std;

	// AES 
	Test<CryptoPP::AES>(); 
	return 0;
}

```
result

```
AES : ECB_MODE
Plain Text
 -> ��
      Ћ~�˹��q��Vr
 -> Plain Text
```

```
fe 
1b 
b 
d0 
8b 
7e 
f4 
cb 
b9 
1c 
ec 
71 
89 
85 
56 
72
```

java side
```java
public static String encrypt(String message) throws Exception{

        if(message == null){
            return null;
        }else{
            String key = "";
            for(int i=0; i<16; i++) {
                key += "A";

            }
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "AES");

            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);

            byte[] encrypted = cipher.doFinal(message.getBytes());

            return byteArrayToHex(encrypted);
        }
    }

    private static String byteArrayToHex(byte[] encrypted) {

        if(encrypted == null || encrypted.length ==0){
            return null;
        }

        StringBuffer sb = new StringBuffer(encrypted.length * 2);
        String hexNumber;

        for(int x=0; x<encrypted.length; x++){
            hexNumber = "0" + Integer.toHexString(0xff & encrypted[x]);
            sb.append(hexNumber.substring(hexNumber.length() - 2));
        }

        return sb.toString();
    }
    
        try {
            Log.i("gl", encrypt("Plain Text"));
        } catch (Exception e) {
            e.printStackTrace();
        }
```
result

>fe1b0bd08b7ef4cbb91cec7189855672

The results of both algorithms are the same.
