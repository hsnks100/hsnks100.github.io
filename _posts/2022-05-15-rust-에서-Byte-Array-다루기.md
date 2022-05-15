---
toc: true
hidden: false
published: true
---

# 바이트 다루기

러스트에서 바이트를 다루는 방법은 너무 많다. 

나도 러스트 초보라서 자세히는 잘 몰라서 예제로만 남겨둠.

# 예제코드

```rust
fn buffer_test1() {
    let mut tt = BytesMut::new();
    tt.put(&b"012345"[..]);
    {
        let mut reader = (&mut tt).reader();
        let mut bb = [0 as u8; 2];
        reader.read(&mut bb);
        println!("{:?}", bb);
        println!("{}", tt.len());
    }
    {
        let mut reader = (&mut tt).reader();
        let mut bb = [0 as u8; 2];
        reader.read(&mut bb);
        println!("{:?}", bb);
    }
}

fn buffer_test2() {
    let mut tt = BytesMut::new();
    tt.put(&b"012345"[..]);
    let mut bb = [0 as u8; 2];
    println!("{:?}", &tt[0..2]);
    tt.copy_to_slice(&mut bb);
    println!("{:?}", bb);
    println!("{}", tt.len());
    tt.copy_to_slice(&mut bb);
    println!("{:?}", bb);
    println!("{}", tt.len());
}

fn buffer_test3() {
    let mut aa = BytesMut::from(&b"0005&000004&abcd"[..]);
    let bb = Bytes::from(&b"0011&000004&abcd"[..]);
    aa.put(bb);
    let mut cloneB = aa.clone();
    aa[0] = 2;
    cloneB[0] = 1;
    println!("{:?} {:?}", aa, cloneB);
}
```

result:

```
-buffer_test1-
[48, 49]
4
[50, 51]
-buffer_test2-
[48, 49]
[48, 49]
4
[50, 51]
2
-buffer_test3-
b"\x02005&000004&abcd0011&000004&abcd" b"\x01005&000004&abcd0011&000004&abcd"
```
