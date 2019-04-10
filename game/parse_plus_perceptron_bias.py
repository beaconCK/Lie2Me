import csv
import random
import math
import numpy as np # numpy is useful for algebraic functions

totalFiles = 1788
trainingQuestion = 0
testingQuestion = False
trainingArray = []
testingArray = []
trainingFileNumberArray = []
randomNumbersAssigned = False
lie_train = []
lie_test = []
epochs = 50
learn_rate = 1.08

#----------PARSE CSV DATA TO PREPARE IT FOR TRAINING AND TESTING THE PERCEPTRON
def parseDataFiles():
    #set up the trainingFilesNumberArray to contain the numbers from 1 to totalFiles, if it has not already been done
    global randomNumbersAssigned
    global trainingFileNumberArray
    global totalFiles
    if randomNumbersAssigned is False:
        for k in range(1, totalFiles + 1):
            trainingFileNumberArray.append(k)
            randomNumbersAssigned = True
    
    #use a for loop to eliminate recursion. should this be a while loop?
    for m in range(0, totalFiles + 1):
        if len(trainingFileNumberArray) > 0:#while all of the data files have not yet been parsed
            print("reading in next file")
            chooseFileNumber()
        else:
            print("train the perceptron")
            trainPerceptron()

def chooseFileNumber():
    global trainingFileNumberArray
    nextFileIndex = random.randint(0, len(trainingFileNumberArray) - 1)
    nextFileNumber = trainingFileNumberArray[nextFileIndex]
    trainingFileNumberArray.pop(nextFileIndex)#remove the current file number fromt the array so that it cannot be used again
    readFileContents(nextFileNumber)

def readFileContents(currentFileNumber):
    nextFileName = 'data/traces_' + str(currentFileNumber) + '.csv'
    with open (nextFileName) as csvfile:
        currentBlob = csv.reader(csvfile, delimiter=',')
        lineArray = []
        for row in currentBlob:
            lineArray.append(row)
        lineArray.pop(0)#get rid of the header row from the file
        traceSpeed = 0
        distanceTravelled = 0
        pauseTime = 0
        lieIndicator = 0
        oldX = 0
        oldY = 0
        for index, currentLine in enumerate(lineArray, start=0):# use an enumerator to keep track of the index as the loop is iterated over
            timeInt = int(currentLine[13])
            if timeInt < 10: # is this the first line of the trace?
                if index > 0: #check that this is not the first trace in the current file
                    previousLine = lineArray[index-1] #get the last timestamp of the previous trace (the total time taken for that trace)
                    traceSpeed = int(distanceTravelled) / int(previousLine[13])# the average speed of the last trace is the distance travelled divided by the total time it took
                    populateArrays(distanceTravelled, pauseTime, traceSpeed, lieIndicator) # send the previous trace's data to the array
                # prepare the values for this new trace
                nextLine = lineArray[index + 1]
                pauseTime = int(nextLine[13])
                lieIndicator = int(currentLine[9])
                oldX = int(currentLine[11])
                oldY = int(currentLine[12])
                distanceTravelled = 0
            else: # not the first line of the trace
                currentX = int(currentLine[11])
                currentY = int(currentLine[12])
                distanceThisFrame = math.sqrt(((currentX - oldX)**2) + ((currentY - oldY)**2))
                distanceTravelled += distanceThisFrame
                oldX = currentX
                oldY = currentY
                if index == len(lineArray) - 1:
                    traceSpeed = int(distanceTravelled) / int(currentLine[13]) # average speed this trace
                    populateArrays(distanceTravelled, pauseTime, traceSpeed, lieIndicator)
        
   

def populateArrays(distanceTravelled, pauseTime, traceSpeed, lieIndicator):
    global trainingQuestion
    global testingQuestion
    global trainingArray
    global lie_train
    global testingArray
    global lie_test
    if trainingQuestion < 8:
        trainingArray.append([distanceTravelled, pauseTime, traceSpeed])
        lie_train.append(lieIndicator)
        trainingQuestion += 1
    elif trainingQuestion > 7 and trainingQuestion < 10:
        trainingQuestion += 1
        testingArray.append([distanceTravelled, pauseTime, traceSpeed])
        lie_test.append(lieIndicator)

    else:
        trainingArray.append([distanceTravelled, pauseTime, traceSpeed])
        lie_train.append(lieIndicator)
        trainingQuestion = 1


#--------------- PERCEPTRON SETUP
class Perceptron():
    def __init__(self): # initialisation function
        self.weights = np.random.rand(3,1)# set up an array of random weights, 3 rows, 1 column
        self.accuracy = 0
        self.samples = 0
        self.bias = 30
	
    def current_accuracy(self):
        return self.accuracy / self.samples

    def activation(self, n): 
        return 0 if n < 0 else 1
		
    def predict(self, input):
        total = self.bias
        for index, weight in enumerate(self.weights, start = 0):
            total += self.weights[index] * input[index]
        return self.activation(total)
		
    def train(self, trainingArray, lie_train, epochs, learn_rate):
        for epoch in range(0, epochs):
            for index, trainingIndex in enumerate(trainingArray, start = 0):
                prediction = self.predict(trainingArray[index])
                print("Expected: " + str(lie_train[index]) + ", Model output: " + str(prediction))
                if int(lie_train[index]) == int(prediction):
                    self.accuracy += 1
                else:
                    self.accuracy -= 1
                self.samples += 1
                loss = lie_train[index] - prediction
                for weightIndex, weight in enumerate(self.weights, start = 0):
                    self.weights[weightIndex] += loss * trainingArray[index][weightIndex] * learn_rate
                self.bias += loss * learn_rate
            print("current accuracy: " + str(self.current_accuracy()))
        print("Perceptron training completed")
        print("*****************")
        print("Number of training files: " + str(len(trainingArray)))
        print("testing perceptron")
        testPerceptron()
	
	
	
    

#---------- CREATE NEW PERCEPTRON (GLOBAL SCOPE)
perceptron = Perceptron() # Initialize a new perceptron

#----------- PERCEPTRON TRAINING
def trainPerceptron():
    global perceptron
    global trainingArray
    global lie_train
    global epochs
    global learn_rate
    # perceptron = Perceptron() # Initialize a new perceptron
    perceptron.train(trainingArray, lie_train, epochs, learn_rate) # Train the perceptron using the training array, the lies array, the number of epochs and the learning rate 

#------------ PERCEPTRON TESTING
def testPerceptron():
    global perceptron
    global testingArray
    global lie_test
    results = []
    for x in (range(len(testingArray))): #for each row of the testing dataset
        run = testingArray[x]
        trial = perceptron.predict(run) # call the results function with the data row
        results.append(trial) #append the results to the results array
    print("Number of testing files: " + str(len(testingArray)))
    print("results:")
    print(results)
    #print("rounded results:")
    #print(np.ravel(np.rint(results))) # View rounded results
    print ("weights: ")
    print(perceptron.weights) #print the final weights to which the perceptron has been trained
    print ("bias: ")
    print(perceptron.bias) #print the bias to which the perceptron has been trained with

  
#------------- MAIN FUNCTION
if __name__ == "__main__":
    parseDataFiles()
