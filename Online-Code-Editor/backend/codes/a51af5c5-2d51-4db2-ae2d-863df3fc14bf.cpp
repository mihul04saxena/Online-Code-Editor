#include<vector>
#include<iostream>
using namespace std;
int main(){
    int n;
    cout<<"Enter the size of array:";
    cin>>n;
    vector<int> vec;
    cout<<"\nInput elements of array\n";
    int k;
    for(int i = 0; i< n; i++){
        cin>>k;
        vec.push_back(k);
    }
    cout<<"Your array is ";
    for(int i = 0; i < n; i++){
        cout<<vec[i];
    }
    return 0;
}
