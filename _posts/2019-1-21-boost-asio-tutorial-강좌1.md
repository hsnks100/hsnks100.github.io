---
layout: posts
tags: [cpp, asio, boost]
---

# asio tutorial1
# 대상
C++ 의 기본적인 문법을 이해하는데 무리가 없고 STL 에 어느정도 거부감이 없는 사람

# 머릿말

거창하게 asio tutorial 이라고 제목은 지어놨는데, 나또한 써보면서 익힌 기능들이나 활용법에 대해서 글을 쓰겠다. asio 는 기본적으로 network 에 대해 특화되었지만, file I/O 에 대해서도 충분히 사용가능하다. 그리고 asio 를 쓰면서 흔히 실수하기 쉬운 사례도 들면서 진행하려 한다. 

Boost.Asio is a cross-platform C++ library for network and low-level I/O programming that provides developers with a consistent asynchronous model using a modern C++ approach.

Boost.Asio 는 네트워크와 저수준 I/O programming 을 위한 크로스 플랫폼 C++ library 다. 관련된 기능을 수행하면서 관련되는 동시성 문제나 lock 문제들을 명시적/암시적으로 modern c++ 스럽게 해결 할 수 있는 도구를 제공해준다.

원론적인 설명을 더 보고 싶으면 boost asio 홈페이지에 들어가서 관련 내용을 더 보시라.

# install

```
sudo apt-get install libboost-all-dev
```

CMakeLists.txt
```

SET(srcs
  main.cpp
  )

add_executable(app.out ${srcs})
target_link_libraries(app.out
  boost_system
  boost_thread 
  )
```

debian 계열 기준으로 위와 같이 설치하면 해당 시스템에서 boost 를 사용할 수 있다.

나머지는 몰라, 알아서 해. 

# 아래 소스를 보기전에... 
```
나는 network tcp/udp 구현하러 왔는데 이게 뭐임? 
```
라는 반응이 있을 수 있다. asio 는 단순 함수를 제공하는 라이브러리라기보단 일종의 source framework 로 바라보는 것이 좋다. asyncronous/syncronous 문제를 어떻게 해결하는지, io_service 관련해서 thread 들이 어떻게 돌아가는지 심층적으로 알기전에는 network 프로그래밍을 하면 피를 본다. 싱글스레드에서의 run 과 멀티스레드에서의 run 이 어떤차이가 있는지, asio 에서는 mutex 를 이용하여 concurrency 를 해결하는지 독자적인 방법이 있는지 눈여겨 봐야한다.

아무래도 전통적인 c++ 에서 비동기처리를 다루지 않다보니, 능숙한 c++ 프로그래머들도 asio 비동기 프로그래밍을 하면서 많은 실수를 한다. 

asio 는 친절하지 않다, 정석적인 사용방법이 아니면 반드시 어디선가 문제가 터진다. 그만큼 주의깊게 써야하는 라이브러리다. 현재는 asio 를 기반으로 하는 network library 도 많지만, 여전히 asio 는 파워풀하다. 



```cpp
//
// timer.cpp
// ~~~~~~~~~
//
// Copyright (c) 2003-2017 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <iostream>
#include <boost/asio.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>

int main()
{
  boost::asio::io_service io;

  boost::asio::deadline_timer t(io, boost::posix_time::seconds(5));
  t.wait();

  std::cout << "Hello, world!" << std::endl;

  return 0;
}
```

asio 는 하나이상의 io_service 를 포함한다. deadline_timer 는 시간과 관련된 wait 나 timeout 을 구현하기 위해 쓴다. 여기서는 wait 를 쓴다.

t.wait(); 하는 순간 5초가 block 되고 5초가 끝나면 Hello, world! 가 출력된다.

# asyncronously timer1

```cpp
//
// timer.cpp
// ~~~~~~~~~
//
// Copyright (c) 2003-2017 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <iostream>
#include <boost/asio.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>

void print(const boost::system::error_code& /*e*/)
{
  std::cout << "Hello, world!" << std::endl;
}

int main()
{
  boost::asio::io_service io;

  boost::asio::deadline_timer t(io, boost::posix_time::seconds(5));
  t.async_wait(&print);

  io.run();

  return 0;
}
```

io_service::run() 에 대해서는 몇가지 알고 가야되는 사실이 있다. 
 - run 은 모든 작업이 완료되기전까지 리턴되지 않는다. 
 - run 안에서 일어나는 콜백 함수들은 run 이 콜된 스레드내부에서 호출된다. 같은 스레드를 가진다.

io_service::run(); 을 통해서만 async 동작이 수행된다. 그리고 위 예제에서는 io.run(); 이 수행되면서 main 이 멈춘 상태로 5 초 멈추고 Hello, world! 를 출력하게 된다. 

# asyncronously timer2



```cpp
//
// timer.cpp
// ~~~~~~~~~
//
// Copyright (c) 2003-2017 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <iostream>
#include <boost/asio.hpp>
#include <boost/bind.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>

void print(const boost::system::error_code& /*e*/,
    boost::asio::deadline_timer* t, int* count)
{
  if (*count < 5)
  {
    std::cout << *count << std::endl;
    ++(*count);

    t->expires_at(t->expires_at() + boost::posix_time::seconds(1));
    t->async_wait(boost::bind(print,
          boost::asio::placeholders::error, t, count));
  }
}

int main()
{
  boost::asio::io_service io;

  int count = 0;
  boost::asio::deadline_timer t(io, boost::posix_time::seconds(1));
  t.async_wait(boost::bind(print,
        boost::asio::placeholders::error, &t, &count));

  io.run();

  std::cout << "Final count is " << count << std::endl;

  return 0;
}
```

이 예제는 asyncronously timer1 의 예제는 살짝 바꾼 버전이다. 어떻게 우리가 정의한 함수에 콜백 파라메터를 넘기는지 잘 보여주고 있다.

그리고 주목해야 할 점은 io_serivce 가 명시적인 stop 이 없이 모든 작업이 완료되고 나서 마지막 문장을 출력하고 끝이 난다. 처음에 말해두었듯이 asio 는 모든 작업이 끝나면 리턴된다. 그리고 print 함수는 async_wait 를 통해 재귀호출을 하면서 수명을 연장해 나가면서 마지막에는 async_wait 를 하지 않으면서 끝이 나게 된다.



# Synchronising handlers in multithreaded programs

```cpp
//
// timer.cpp
// ~~~~~~~~~
//
// Copyright (c) 2003-2016 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <iostream>
#include <boost/asio.hpp>
#include <boost/thread/thread.hpp>
#include <boost/bind.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>

class printer
{
public:
  printer(boost::asio::io_service& io)
    : strand_(io),
      timer1_(io, boost::posix_time::seconds(1)),
      timer2_(io, boost::posix_time::seconds(1)),
      count_(0)
  {
    timer1_.async_wait(strand_.wrap(boost::bind(&printer::print1, this)));
    timer2_.async_wait(strand_.wrap(boost::bind(&printer::print2, this)));
  }

  ~printer()
  {
    std::cout << "Final count is " << count_ << std::endl;
  }

  void print1()
  {
    if (count_ < 10)
    {
      std::cout << "Timer 1: " << count_ << std::endl;
      ++count_;

      timer1_.expires_at(timer1_.expires_at() + boost::posix_time::seconds(1));
      timer1_.async_wait(strand_.wrap(boost::bind(&printer::print1, this)));
    }
  }

  void print2()
  {
    if (count_ < 10)
    {
      std::cout << "Timer 2: " << count_ << std::endl;
      ++count_;

      timer2_.expires_at(timer2_.expires_at() + boost::posix_time::seconds(1));
      timer2_.async_wait(strand_.wrap(boost::bind(&printer::print2, this)));
    }
  }

private:
  boost::asio::io_service::strand strand_;
  boost::asio::deadline_timer timer1_;
  boost::asio::deadline_timer timer2_;
  int count_;
};

int main()
{
  boost::asio::io_service io;
  printer p(io);
  boost::thread t(boost::bind(&boost::asio::io_service::run, &io));
  io.run();
  t.join();

  return 0;
}
```

이 예제에서는 strand 를 이용하여 멀티 스레드 환경에서 콜백 핸들러를 동기화하는 방법을 보여준다. 지금까지의 예제에서는 run 이 싱글스레드로 작동하여 동시성 문제가 발생하지 않았지만, 지금 예제에서는 서로다른 스레드에서 run 이 수행된다. 멀티 스레드 방식은 특정 I/O 처리기가 오래 걸리거나 할 때 스레드를 여러개로 늘려서 수행 할 수 있는 작업은 수행할 수 있도록 한다. 

이 예제에서는 모든 함수 print1, print2 가 하나의 strand 로 묶이는 예제라 서로 간섭을 하지 않는다.

즉, 요약하면 하나의 같은 strand 내의 asyncronos function 은 동시에 실행되지 않는다. (매우 중요!)


# TCP Server Program


```cpp
//
// server.cpp
// ~~~~~~~~~~
//
// Copyright (c) 2003-2016 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <ctime>
#include <iostream>
#include <string>
#include <boost/array.hpp>
#include <boost/bind.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/enable_shared_from_this.hpp>
#include <boost/asio.hpp>
#include <boost/thread/thread.hpp>

using boost::asio::ip::tcp;

std::string make_daytime_string()
{
    using namespace std; // For time_t, time and ctime;
    time_t now = time(0);
    return ctime(&now);
}


class tcp_connection
    : public boost::enable_shared_from_this<tcp_connection>
{
public:
    typedef boost::shared_ptr<tcp_connection> pointer;

    static pointer create(boost::asio::io_service& io_service) {
        return pointer(new tcp_connection(io_service));
    }

    tcp::socket& socket() {
        return socket_;
    }

    void start() {
        message_ = make_daytime_string();

        boost::asio::async_write(socket_, boost::asio::buffer(message_),
                                 boost::bind(&tcp_connection::handle_write, shared_from_this()));
    }

private:
    tcp_connection(boost::asio::io_service& io_service)
        : socket_(io_service)
    {
    }

    void handle_write() {
    }

    tcp::socket socket_;
    std::string message_;
};

class tcp_server
{
public:
    tcp_server(boost::asio::io_service& io_service)
        : acceptor_(io_service, tcp::endpoint(tcp::v4(), 13))
    {
        start_accept();
    }

private:
    void start_accept()
    {
        tcp_connection::pointer new_connection =
            tcp_connection::create(acceptor_.get_io_service());

        acceptor_.async_accept(new_connection->socket(),
                               boost::bind(&tcp_server::handle_accept, this, new_connection,
                                           boost::asio::placeholders::error));
    }

    void handle_accept(tcp_connection::pointer new_connection,
                       const boost::system::error_code& error) {
        if (!error) {
            new_connection->start();
        }

        start_accept();
    }

    tcp::acceptor acceptor_;
};

int main()
{
    try {

        auto t = boost::thread([]() {
                boost::asio::io_service io_service;
                tcp_server server1(io_service);
                io_service.run();
            });

        t.detach();
    }
    catch (std::exception& e) {
        std::cerr << e.what() << std::endl;
    }

    getchar();

    return 0;
}

```

기본적인 TCP program 형태를 asio 로 작성한 모습이다. tcp_server 는 새로운 클라이언트를 받아들이는 역할을 한다. 새로운 클라이언트를 받아들였으면, tcp_connection 에서 각 클라이언트에 대한 처리 로직이 들어가는 구조다. tcp_server 에서 async_accept 를 통해 새 클라이언트를 받으면 내부에서 tcp_connection 을 생성하여 async 로직을 등록한다. 예제에서는 async_write 로 바로 답하고 있지만 보통은 클라이언트가 요청을 하기 때문에, read -> write 서버구조로 만든다.

```cpp
class tcp_connection
    : public boost::enable_shared_from_this<tcp_connection>
```

해당 구조에 대해 이야기가 필요하다. 

이 소스에서 tcp_connection 은 shared_ptr 로 되어있다. 그리고 함수 안에서 생성되기 때문에 생성된 곳의 블록이 끝나면 소멸할 타이밍을 맞는다.

```cpp
    static pointer create(boost::asio::io_service& io_service) {
        return pointer(new tcp_connection(io_service));
    }

    
    void start() {
        message_ = make_daytime_string();

        boost::asio::async_write(socket_, boost::asio::buffer(message_),
                                 boost::bind(&tcp_connection::handle_write, shared_from_this()));
    }
```

생성한 쪽에서 tcp_connection::start 를 호출하게 되는데 문제는 async_write 가 실행되지만 tcp_connection 의 수명이 해당 블록이 끝나자마자 소멸이 되어 handle_write 가 호출되지 못한다. 그리하여 io_service 는 모든 작업이 완료된 것으로 알고 io_service::run 이 리턴되게된다. 

그래서 위 코드와 같이 this 대신에 shared_from_this 를 쓰면 해당 콜백이 불러질 때 까지 this 객체는 수명이 연장된다. 이렇게 중요한 shared_from_this 를 쓰기 위해서는 boost::enable_shared_from<T> 를 상속 받아야 한다. 

이와 같은 템플릿 자가 상속 패턴을 CRTP 라고 하니 궁금한 사람은 따로 구글링해보기 바란다.


  
  
# boost asio shared_const_buffer


```cpp

//
// reference_counted.cpp
// ~~~~~~~~~~~~~~~~~~~~~
//
// Copyright (c) 2003-2016 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <boost/asio.hpp>
#include <iostream>
#include <memory>
#include <utility>
#include <vector>

using boost::asio::ip::tcp;

// A reference-counted non-modifiable buffer class.
class shared_const_buffer
{
public:
  // Construct from a std::string.
  explicit shared_const_buffer(const std::string& data)
    : data_(new std::vector<char>(data.begin(), data.end())),
      buffer_(boost::asio::buffer(*data_))
  {
  }

  // Implement the ConstBufferSequence requirements.
  typedef boost::asio::const_buffer value_type;
  typedef const boost::asio::const_buffer* const_iterator;
  const boost::asio::const_buffer* begin() const { return &buffer_; }
  const boost::asio::const_buffer* end() const { return &buffer_ + 1; }

private:
  std::shared_ptr<std::vector<char> > data_;
  boost::asio::const_buffer buffer_;
};

class session
  : public std::enable_shared_from_this<session>
{
public:
  session(tcp::socket socket)
    : socket_(std::move(socket))
  {
  }

  void start()
  {
    do_write();
  }

private:
  void do_write()
  {
    std::time_t now = std::time(0);
    shared_const_buffer buffer(std::ctime(&now));

    auto self(shared_from_this());
    boost::asio::async_write(socket_, buffer,
        [this, self](boost::system::error_code /*ec*/, std::size_t /*length*/)
        {
        });
  }

  // The socket used to communicate with the client.
  tcp::socket socket_;
};

class server
{
public:
  server(boost::asio::io_service& io_service, short port)
    : acceptor_(io_service, tcp::endpoint(tcp::v4(), port)),
      socket_(io_service)
  {
    do_accept();
  }

private:
  void do_accept()
  {
    acceptor_.async_accept(socket_,
        [this](boost::system::error_code ec)
        {
          if (!ec)
          {
            std::make_shared<session>(std::move(socket_))->start();
          }

          do_accept();
        });
  }

  tcp::acceptor acceptor_;
  tcp::socket socket_;
};

int main(int argc, char* argv[])
{
  try
  {
    if (argc != 2)
    {
      std::cerr << "Usage: reference_counted <port>\n";
      return 1;
    }

    boost::asio::io_service io_service;

    server s(io_service, std::atoi(argv[1]));

    io_service.run();
  }
  catch (std::exception& e)
  {
    std::cerr << "Exception: " << e.what() << "\n";
  }

  return 0;
}

```


원래의 예제에서는 자료 전송을 위해서 메모리상의 상주하는 멤버변수 같은 메모리가 필요했다. Buffer 는 

 buffers

 One or more buffers containing the data to be written. 
 Although the buffers object may be copied as necessary, ownership of the underlying memory blocks is retained by the caller, 
 which must guarantee that they remain valid until the handler is called.


콜백 핸들러가 호출될 때 까지 이 메모리의 valid 는 보증되어야 한다. 그래서 멤버변수로 잡은 것이다. ConstBufferSequenece 를 이용하면 이러한 작업을 local scope 단위에서 처리할 수 있다.

그러기 위해서는 몇가지 구현사항이 필요하다. ConstBufferSequence 를 만족하기 위해서는 

```cpp
  typedef boost::asio::const_buffer value_type;
  typedef const boost::asio::const_buffer* const_iterator;
  const boost::asio::const_buffer* begin() const { return &buffer_; }
  const boost::asio::const_buffer* end() const { return &buffer_ + 1; }
```

위 구현이 필요한데, 자세한 것은 https://www.boost.org/doc/libs/1_69_0/doc/html/boost_asio/reference/ConstBufferSequence.html 참고하라.


  
