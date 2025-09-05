---
toc: true
tags: [algorithm, fft, big-number, cpp]
---

# FFT를 이용한 큰 수 곱셈

큰 수의 곱셈을 효율적으로 처리하는 방법에 대해 알아보자. 일반적으로 두 개의 큰 수를 곱할 때는 각 자릿수를 하나씩 곱해서 더하는 방식을 사용하는데, 이는 O(n²)의 시간복잡도를 가진다. 하지만 FFT(Fast Fourier Transform)를 사용하면 O(n log n)의 시간복잡도로 큰 수의 곱셈을 처리할 수 있다.

## FFT란?

FFT는 이산 푸리에 변환(DFT)을 빠르게 계산하는 알고리즘이다. 신호처리나 이미지 처리에서 많이 사용되지만, 큰 수의 곱셈에서도 매우 유용하다. 

왜 FFT가 큰 수 곱셈에 유용한가? 두 다항식의 곱셈을 생각해보자. 다항식 A(x)와 B(x)의 곱셈 결과 C(x) = A(x) × B(x)에서, C(x)의 계수들은 A(x)와 B(x)의 계수들로부터 계산된다. 이 과정에서 FFT를 사용하면 효율적으로 계산할 수 있다.

## 구현 방법

큰 수를 다항식으로 표현하는 방법부터 시작해보자. 예를 들어 1234라는 수는 1×10³ + 2×10² + 3×10¹ + 4×10⁰으로 표현할 수 있다. 이를 다항식으로 표현하면 1x³ + 2x² + 3x + 4가 된다.

FFT를 사용한 곱셈의 기본 아이디어는:
1. 두 수를 다항식으로 변환
2. 각 다항식에 FFT 적용
3. 대응하는 계수들을 곱함
4. 역 FFT 적용
5. 결과를 다시 수로 변환

이제 실제 구현을 살펴보자.

```cpp
#include <vector>
#include <complex>
#include <iostream>
using namespace std;

typedef complex<double> base; 
 
void fft(vector<base> &a, bool inv) {
    int n = (int) a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        while (!((j ^= bit) & bit)) bit >>= 1;
        if (i < j) swap(a[i], a[j]);
    }
    for (int i = 1; i < n; i <<= 1) {
        double x = inv ? M_PI / i : -M_PI / i;
        base w = {cos(x), sin(x)};
        for (int j = 0; j < n; j += i << 1) {
            base th = {1, 0};
            for (int k = 0; k < i; k++) {
                base tmp = a[i + j + k] * th;
                a[i + j + k] = a[j + k] - tmp;
                a[j + k] += tmp;
                th *= w;
            }
        }
    }
    if (inv) {
        for (int i = 0; i < n; i++) {
            a[i] /= n;
        }
    }
}

void multiply(vector<base> &a, vector<base> &b) {
    int n = (int) max(a.size(), b.size());
    int i = 0;
    while ((1 << i) < (n << 1)) i++;
    n = 1 << i;
    a.resize(n);
    b.resize(n);
    fft(a, false);
    fft(b, false);
    for (int i = 0; i < n; i++) {
        a[i] *= b[i];
    }
    fft(a, true);
}

int main() {
    std::string A = "2485793457934579457945";
    std::string B = "23458934573945793457943579435345";
    //cin >> A >> B;
    if(A == "0" || B == "0") {
        cout << 0 << endl;
        return 0;
    }
    vector<base> a;
    vector<base> b;

    for(int i=A.size()-1; i>=0; i--) {
        a.push_back(base(A[i] - '0', 0));
    }
    for(int i=B.size()-1; i>=0; i--) {
        b.push_back(base(B[i] - '0', 0));
    }
    multiply(a, b);

    vector<int> res(a.size());
    for(int i=0; i<a.size(); i++) {
        res[i] = a[i].real() + 0.5;
    }
    vector<int> ans;
    int carry = 0;
    for(int i=0; i<res.size(); i++) { 
        int g = res[i] + carry;
        int num = g % 10;
        carry = g / 10;
        ans.push_back(num);
    }
    bool startFlag = false;
    for(int i=ans.size()-1; i>=0; i--) { 
        if(ans[i] != 0) {
            startFlag = true; 
        }
        if(startFlag) {
            std::cout << ans[i];
        }
    } 
}
```

## 코드 설명

위 코드에서 핵심적인 부분들을 살펴보자.

### FFT 함수
```cpp
void fft(vector<base> &a, bool inv)
```
이 함수는 FFT 또는 역 FFT를 수행한다. `inv`가 true이면 역 FFT, false이면 FFT를 수행한다. 

첫 번째 루프에서는 비트 리버설(bit reversal)을 수행한다. 이는 FFT 알고리즘의 특성상 필요한 과정이다.

두 번째 루프에서는 실제 FFT 계산을 수행한다. 각 단계에서 복소수 단위원 위의 점들을 사용하여 변환을 수행한다.

### 곱셈 함수
```cpp
void multiply(vector<base> &a, vector<base> &b)
```
이 함수는 두 다항식의 곱셈을 FFT를 사용하여 수행한다. 

1. 두 벡터의 크기를 2의 거듭제곱으로 맞춘다
2. 각각에 FFT를 적용한다
3. 대응하는 계수들을 곱한다
4. 역 FFT를 적용한다

### 메인 함수
메인 함수에서는 문자열로 입력받은 큰 수들을 다항식으로 변환하고, 곱셈을 수행한 후 결과를 다시 문자열로 변환한다.

## 시간복잡도

일반적인 큰 수 곱셈은 O(n²)의 시간복잡도를 가지지만, FFT를 사용하면 O(n log n)의 시간복잡도로 처리할 수 있다. 이는 매우 큰 수의 곱셈에서 상당한 성능 향상을 가져온다.

## 주의사항

FFT를 사용한 큰 수 곱셈에서 주의해야 할 점들:

1. **정밀도 문제**: 복소수 연산에서 부동소수점 오차가 발생할 수 있다
2. **메모리 사용량**: FFT는 추가적인 메모리가 필요하다
3. **입력 크기**: 작은 수의 경우 일반 곱셈이 더 빠를 수 있다

이러한 방법을 통해 매우 큰 수의 곱셈을 효율적으로 처리할 수 있다. 암호학이나 수학 계산에서 자주 사용되는 기법이니 알아두면 유용할 것이다.
