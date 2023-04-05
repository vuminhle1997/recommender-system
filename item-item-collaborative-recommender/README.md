# Item-Item-Filter
The item-item-filter calculates the similarity score for each item "i" and compares each item with another item "j" in the set of items "I".
The higher score to is "j" to "i" (-> 1), then more likely is "j" more similar to "i".
This algorithm makes a similarity matrix between items only, not users. (hence the name: Item-Item)
## Run and install
First install the dependencies and run the scripts with the third command. It will output the results.
````shell
yarn set version 3.4.1
yarn install
yarn dev
````
