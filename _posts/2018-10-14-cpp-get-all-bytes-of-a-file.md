---
layout: posts
tags: [cpp, buffer]
---
```cpp

#include <fstream>
#include <memory>


int main() {
    std::ifstream infile("wow.text");

    //get length of file
    infile.seekg(0, infile.end);
    size_t length = infile.tellg();
    infile.seekg(0, infile.beg);

    //read file
    std::shared_ptr<uint8_t> buffer(new uint8_t[length], [](uint8_t* p){ delete [] p; });
    infile.read(buffer.get(), length);
}
```
