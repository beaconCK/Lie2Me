import csv
import random
import math
import numpy as np # numpy is useful for algebraic functions

totalFiles = 1788
trainingQuestion = True
trainingArray = []
testingArray = []
trainingFileNumberArray = []
randomNumbersAssigned = False
lie_train = []
lie_test = []

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
    trainingFileNumberArray.pop(nextFileIndex)#remove the current file number from the array so that it cannot be used again
    readFileContents(nextFileNumber)

def readFileContents(currentFileNumber):
    nextFileName = 'data/traces_' + str(currentFileNumber) + '.csv';
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
    global trainingArray
    global lie_train
    global testingArray
    global lie_test
    if trainingQuestion == True:
        trainingArray.append([distanceTravelled, pauseTime, traceSpeed])
        lie_train.append(lieIndicator)
        trainingQuestion = False
    else:
        testingArray.append([distanceTravelled, pauseTime, traceSpeed])
        lie_test.append(lieIndicator)
        trainingQuestion = True


#--------------- PERCEPTRON SETUP
class Perceptron():
    def __init__(self): # initialisation function
        self.syn_weights = np.random.rand(3,1)# set up an array of random weights, 3 rows, 1 column 

    def sigmoid(self, x): # sigmoid function for the forward pass. The sigmoid of x = 1 dividded by 1 + exponent to the minus x. In this case x is an array of numbers (probably floats)
        return (1 / (1 + np.exp(-x))) # returns an array

    def sigmoid_deriv(self, x): # derivative of the sigmoid function. exponent to the minus x divided by (1 + exponent to the minus x) to the power of 2
        return np.exp(-x)/((1 + np.exp(-x))**2) 

    def train(self, inputs, real_outputs, its, lr): # perceptron training function (input array, truths array, epochs/iterations, learn rate)
        delta_weights = np.zeros((3,len(inputs))) # an array of zeroes 3 columns wide and with the same number of rows as the input array to hold the calculated partial derivatives. To keep track of how the cost changes with respect to any change in weights
        for iteration in (range(its)):#iterate over the epochs
            # forward pass
            z = np.dot(inputs, self.syn_weights) # the dot product of the neuron inputs (in this case 7 rows and 4 columns) multiplied by the weights (in this case 4 rows of 1 column)
            activation = self.sigmoid(z) # pass the z array into the sigmoid function
            # back pass
            for i in range(len(inputs)): # the number of rows in the input array
                cost = (activation[i] - real_outputs[i])**2 # cost is another name for loss. 
                cost_prime = 2*(activation[i] - real_outputs[i])
                for n in range(3): # 3 in this case is the number of columns in each row
                    delta_weights[n][i] = cost_prime * inputs[i][n] * self.sigmoid_deriv(z[i]) # store the derivatives in the delta_weights array to calculate the best cost-to-weight ratio
            delta_avg = np.array([np.average(delta_weights, axis=1)]).T # create a new transpose (.T) array holding the average of each row of the delta_weights array
            self.syn_weights = self.syn_weights - delta_avg*lr # update the weights array by subtracting the (derived average array multiplied by the learning rate)
        print("testing perceptron")
        testPerceptron()

    def results(self, inputs): #results function
        return self.sigmoid(np.dot(inputs, self.syn_weights))

#---------- CREATE NEW PERCEPTRON (GLOBAL SCOPE)
perceptron = Perceptron() # Initialize a new perceptron

#----------- PERCEPTRON TRAINING
def trainPerceptron():
    global perceptron
    global trainingArray
    global lie_train
    # perceptron = Perceptron() # Initialize a new perceptron
    perceptron.train(trainingArray, lie_train, 1800, 0.7) # Train the perceptron using the training array, the lies array, the number of epochs and the learning rate 

#------------ PERCEPTRON TESTING
def testPerceptron():
    global perceptron
    global testingArray
    global lie_test
    results = []
    for x in (range(len(testingArray))): #for each row of the testing dataset
        run = testingArray[x]
        trial = perceptron.results(run) # call the results function with the data row
        results.append(trial.tolist()) #append the results to the results array
    print("results:")
    print(results)
    print("rounded results:")
    print(np.ravel(np.rint(results))) # View rounded results
    print ("weights: ")
    print(perceptron.syn_weights) #print the final weights to which the perceptron has been trained

  
#------------- MAIN FUNCTION
if __name__ == "__main__":
    parseDataFiles()
