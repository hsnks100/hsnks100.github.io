```cpp

template <typename T>
T interpolate( std::vector<T> &xData, std::vector<T> &yData, T x) {
   int size = xData.size();
   int i = 0;
   if ( x >= xData[size - 2] ) {
      i = size - 2;
   }
   else {
      while ( x > xData[i+1] ) i++;
   }
   T xL = xData[i];
   T yL = yData[i];
   T xR = xData[i+1];
   T yR = yData[i+1];      // points on either side (unless beyond ends)
   T dydx = ( yR - yL ) / ( xR - xL );                                    // gradient
   return yL + dydx * ( x - xL );                                              // linear interpolation
}

//======================================================================
int main()
{
    // Original data
    std::vector<double> xData = { 1, 5, 10, 15, 20 };
    std::vector<double> yData = { 0.3, 0.5, 0.8, 0.1, 0.14 };

    std::cout << interpolate(xData, yData, 0.0) << std::endl;
    std::cout << interpolate(xData, yData, 2.0) << std::endl;
    std::cout << interpolate(xData, yData, 5.0) << std::endl;
    std::cout << interpolate(xData, yData, 30.0) << std::endl;

    std::cout << interpolate(xData, yData, 0.0) << std::endl;
    std::cout << interpolate(xData, yData, 2.0) << std::endl;
    std::cout << interpolate(xData, yData, 5.0) << std::endl;
    std::cout << interpolate(xData, yData, 30.0) << std::endl;


}
```
