// ML Implementation for Crop Management System Using Real Datasets
// This code demonstrates how to build, train and integrate an ML model using your crop datasets

// ML Implementation for Crop Management System Using Real Datasets
// Modified ML Implementation for Crop Management System
// This version does not require actual file reading and uses synthetic data instead




// import * as tf from '@tensorflow/tfjs';

// /**
//  * Main class for the Crop Recommendation ML System
//  */
// class CropRecommendationML {
//   constructor() {
//     this.model = null;
//     this.datasetStats = null; // For normalization
//     this.cropTypes = ["Tomato", "Brinjal", "Capsicum", "Potato"];
//     this.landTypes = ["Dry land", "Coastal land", "Malnad region"];
//     this.growthStages = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Ripening"];
//     this.initialized = false;
//   }

//   /**
//    * Initialize the ML system by loading and processing datasets
//    */
//   async initialize() {
//     try {
//       console.log("Initializing ML system...");
      
//       // Try to load a pre-trained model if available
//       try {
//         this.model = await tf.loadLayersModel('indexeddb://crop-recommendation-model');
//         console.log("Loaded pre-trained model from storage");
//         this.initialized = true;
//         return true;
//       } catch (e) {
//         console.log("No pre-trained model found, will train a new one using synthetic data");
//       }

//       // Generate synthetic datasets for all crops
//       const datasets = this.generateSyntheticDatasets();
      
//       // Process and prepare data for training
//       const { trainingData, validationData, stats } = this.prepareDataForTraining(datasets);
//       this.datasetStats = stats;
      
//       // Build and train the model
//       this.model = await this.buildAndTrainModel(trainingData, validationData);
      
//       // Save the trained model for future use
//       await this.model.save('indexeddb://crop-recommendation-model');
      
//       console.log("ML system initialization complete with synthetic data");
//       this.initialized = true;
//       return true;
//     } catch (error) {
//       console.error("Error initializing ML system:", error);
//       return false;
//     }
//   }

//   /**
//    * Generate synthetic datasets for all crops
//    */
//   generateSyntheticDatasets() {
//     console.log("Generating synthetic datasets for all crops");
//     const datasets = {};
    
//     // Use the existing parseCSVData function to generate data
//     const allData = parseCSVData().data;
    
//     // Split data by crop type
//     this.cropTypes.forEach(cropType => {
//       datasets[cropType.toLowerCase()] = allData.filter(item => item.crop === cropType);
//     });
    
//     console.log(`Generated synthetic datasets for ${Object.keys(datasets).length} crops`);
//     return datasets;
//   }

//   /**
//    * Prepare and process data for training
//    */
//   prepareDataForTraining(datasets) {
//     // Combine all datasets
//     let allData = [];
//     Object.keys(datasets).forEach(cropType => {
//       allData = allData.concat(datasets[cropType]);
//     });
    
//     console.log(`Total combined dataset size: ${allData.length} rows`);
    
//     // Calculate statistics for normalization
//     const stats = this.calculateDatasetStats(allData);
    
//     // Create training examples
//     const examples = this.createTrainingExamples(allData, stats);
    
//     // Shuffle examples
//     tf.util.shuffle(examples);
    
//     // Split into training and validation sets (80/20)
//     const splitIdx = Math.floor(examples.length * 0.8);
//     const trainingData = examples.slice(0, splitIdx);
//     const validationData = examples.slice(splitIdx);
    
//     console.log(`Training set: ${trainingData.length} examples, Validation set: ${validationData.length} examples`);
    
//     return { trainingData, validationData, stats };
//   }

//   /**
//    * Calculate dataset statistics for normalization
//    */
//   calculateDatasetStats(data) {
//     // Initialize stat trackers for numerical columns
//     const stats = {
//       day: { min: Infinity, max: -Infinity },
//       soilTemp: { min: Infinity, max: -Infinity },
//       soilMoisture: { min: Infinity, max: -Infinity },
//       pH: { min: Infinity, max: -Infinity },
//       ec: { min: Infinity, max: -Infinity },
//       nitrogen: { min: Infinity, max: -Infinity },
//       phosphorus: { min: Infinity, max: -Infinity },
//       potassium: { min: Infinity, max: -Infinity }
//     };
    
//     // Calculate min and max for each numerical feature
//     data.forEach(row => {
//       Object.keys(stats).forEach(feature => {
//         if (row[feature] !== undefined && row[feature] !== null) {
//           stats[feature].min = Math.min(stats[feature].min, row[feature]);
//           stats[feature].max = Math.max(stats[feature].max, row[feature]);
//         }
//       });
//     });
    
//     console.log("Dataset statistics for normalization:", stats);
//     return stats;
//   }

//   /**
//    * Create training examples with features and labels
//    */
//   createTrainingExamples(data, stats) {
//     const examples = [];
    
//     // Create examples by comparing each row with the ideal values
//     for (let i = 0; i < data.length; i++) {
//       const currentRow = data[i];
      
//       // Find the ideal values for this crop, growth stage and land type
//       const idealValues = this.findIdealValues(data, currentRow);
      
//       if (!idealValues) continue; // Skip if no ideal values found
      
//       // Create simulated "current readings" with random deviations from ideal values
//       // In a real-world scenario, these would be actual sensor readings
//       const simulatedReadings = this.createSimulatedReadings(idealValues);
      
//       // Calculate deviations from ideal values
//       const deviations = this.calculateDeviations(simulatedReadings, idealValues);
      
//       // Determine if adjustments are needed based on deviations
//       const adjustments = this.determineAdjustments(deviations);
      
//       // Create normalized features
//       const features = this.createNormalizedFeatures(
//         currentRow, 
//         simulatedReadings, 
//         deviations, 
//         stats
//       );
      
//       // Add example to the list
//       examples.push({
//         features,
//         labels: adjustments
//       });
//     }
    
//     console.log(`Created ${examples.length} training examples`);
//     return examples;
//   }

//   /**
//    * Find ideal values for a crop, growth stage and land type
//    */
//   findIdealValues(data, row) {
//     // Get all rows matching this crop, growth stage and land type
//     const matchingRows = data.filter(item => 
//       item.crop === row.crop && 
//       item.growthStage === row.growthStage && 
//       item.landType === row.landType
//     );
    
//     if (matchingRows.length === 0) return null;
    
//     // Calculate average values as ideal values
//     const idealValues = {
//       soilTemp: this.calculateAverage(matchingRows, 'soilTemp'),
//       soilMoisture: this.calculateAverage(matchingRows, 'soilMoisture'),
//       pH: this.calculateAverage(matchingRows, 'pH'),
//       ec: this.calculateAverage(matchingRows, 'ec'),
//       nitrogen: this.calculateAverage(matchingRows, 'nitrogen'),
//       phosphorus: this.calculateAverage(matchingRows, 'phosphorus'),
//       potassium: this.calculateAverage(matchingRows, 'potassium')
//     };
    
//     return idealValues;
//   }

//   /**
//    * Calculate average value for a specific column in a dataset
//    */
//   calculateAverage(data, column) {
//     const sum = data.reduce((acc, row) => acc + row[column], 0);
//     return sum / data.length;
//   }

//   /**
//    * Create simulated sensor readings with random deviations from ideal values
//    */
//   createSimulatedReadings(idealValues) {
//     const readings = {};
    
//     // Add random deviations to ideal values to simulate sensor readings
//     readings.soilTemp = idealValues.soilTemp + (Math.random() * 6 - 3); // ±3°C
//     readings.soilMoisture = idealValues.soilMoisture + (Math.random() * 20 - 10); // ±10%
//     readings.pH = idealValues.pH + (Math.random() * 1 - 0.5); // ±0.5
//     readings.ec = idealValues.ec + (Math.random() * 300 - 150); // ±150 µS/cm
//     readings.nitrogen = idealValues.nitrogen + (Math.random() * 60 - 30); // ±30 mg/kg
//     readings.phosphorus = idealValues.phosphorus + (Math.random() * 20 - 10); // ±10 mg/kg
//     readings.potassium = idealValues.potassium + (Math.random() * 60 - 30); // ±30 mg/kg
    
//     return readings;
//   }

//   /**
//    * Calculate deviations between current readings and ideal values
//    */
//   calculateDeviations(readings, idealValues) {
//     const deviations = {};
    
//     Object.keys(readings).forEach(param => {
//       // Calculate absolute and percentage deviations
//       const absoluteDeviation = readings[param] - idealValues[param];
//       const percentageDeviation = (absoluteDeviation / idealValues[param]) * 100;
      
//       deviations[param] = {
//         absolute: absoluteDeviation,
//         percentage: percentageDeviation
//       };
//     });
    
//     return deviations;
//   }

//   /**
//    * Determine if adjustments are needed based on deviations
//    */
//   determineAdjustments(deviations) {
//     // Define thresholds for adjustments (based on your original rule-based logic)
//     const thresholds = {
//       soilTemp: 2,
//       soilMoisture: 5,
//       pH: 0.3,
//       ec: 100,
//       nitrogen: 20,
//       phosphorus: 10,
//       potassium: 20
//     };
    
//     const adjustments = {};
    
//     Object.keys(deviations).forEach(param => {
//       const absDeviation = Math.abs(deviations[param].absolute);
//       const needsAdjustment = absDeviation > thresholds[param];
//       const adjustmentType = deviations[param].absolute > 0 ? 'decrease' : 'increase';
      
//       adjustments[`needs_${param}_adjustment`] = needsAdjustment ? 1 : 0;
//       adjustments[`${param}_adjustment_type`] = adjustmentType === 'increase' ? 1 : 0;
//     });
    
//     return adjustments;
//   }

//   /**
//    * Create normalized feature vector
//    */
//   createNormalizedFeatures(row, readings, deviations, stats) {
//     // Normalize numerical features
//     const normalizedFeatures = {
//       // Normalize day
//       day: (row.day - stats.day.min) / (stats.day.max - stats.day.min),
      
//       // Normalize current readings
//       soil_temp: (readings.soilTemp - stats.soilTemp.min) / 
//                  (stats.soilTemp.max - stats.soilTemp.min),
//       soil_moisture: (readings.soilMoisture - stats.soilMoisture.min) / 
//                      (stats.soilMoisture.max - stats.soilMoisture.min),
//       ph: (readings.pH - stats.pH.min) / (stats.pH.max - stats.pH.min),
//       ec: (readings.ec - stats.ec.min) / 
//           (stats.ec.max - stats.ec.min),
//       nitrogen: (readings.nitrogen - stats.nitrogen.min) / 
//                 (stats.nitrogen.max - stats.nitrogen.min),
//       phosphorus: (readings.phosphorus - stats.phosphorus.min) / 
//                   (stats.phosphorus.max - stats.phosphorus.min),
//       potassium: (readings.potassium - stats.potassium.min) / 
//                  (stats.potassium.max - stats.potassium.min),
      
//       // Normalize absolute deviations
//       soil_temp_dev: deviations.soilTemp.absolute / 10, // Assuming max deviation of ±10°C
//       soil_moisture_dev: deviations.soilMoisture.absolute / 20, // Assuming max deviation of ±20%
//       ph_dev: deviations.pH.absolute / 2, // Assuming max deviation of ±2
//       ec_dev: deviations.ec.absolute / 500, // Assuming max deviation of ±500 µS/cm
//       nitrogen_dev: deviations.nitrogen.absolute / 100, // Assuming max deviation of ±100 mg/kg
//       phosphorus_dev: deviations.phosphorus.absolute / 30, // Assuming max deviation of ±30 mg/kg
//       potassium_dev: deviations.potassium.absolute / 100 // Assuming max deviation of ±100 mg/kg
//     };
    
//     // One-hot encode categorical features
    
//     // Crop type
//     this.cropTypes.forEach(crop => {
//       normalizedFeatures[`crop_${crop.toLowerCase()}`] = row.crop === crop ? 1 : 0;
//     });
    
//     // Growth stage
//     this.growthStages.forEach(stage => {
//       const stageKey = stage.toLowerCase().replace(/\s+/g, '_');
//       normalizedFeatures[`stage_${stageKey}`] = row.growthStage === stage ? 1 : 0;
//     });
    
//     // Land type
//     this.landTypes.forEach(land => {
//       const landKey = land.toLowerCase().replace(/\s+/g, '_');
//       normalizedFeatures[`land_${landKey}`] = row.landType === land ? 1 : 0;
//     });
    
//     return normalizedFeatures;
//   }

//   /**
//    * Build and train the ML model
//    */
//   async buildAndTrainModel(trainingData, validationData) {
//     // Prepare tensors for training
//     const { xs: trainXs, ys: trainYs } = this.prepareTrainingTensors(trainingData);
//     const { xs: valXs, ys: valYs } = this.prepareTrainingTensors(validationData);
    
//     // Get input and output dimensions
//     const inputDim = Object.keys(trainingData[0].features).length;
//     const outputDim = Object.keys(trainingData[0].labels).length;
    
//     console.log(`Building model with input dimension ${inputDim} and output dimension ${outputDim}`);
    
//     // Create model architecture
//     const model = tf.sequential();
    
//     // Input layer
//     model.add(tf.layers.dense({
//       inputShape: [inputDim],
//       units: 64,
//       activation: 'relu',
//       kernelInitializer: 'heNormal'
//     }));
    
//     // Hidden layers
//     model.add(tf.layers.dropout({ rate: 0.2 }));
    
//     model.add(tf.layers.dense({
//       units: 32,
//       activation: 'relu',
//       kernelInitializer: 'heNormal'
//     }));
    
//     model.add(tf.layers.dropout({ rate: 0.2 }));
    
//     // Output layer
//     model.add(tf.layers.dense({
//       units: outputDim,
//       activation: 'sigmoid'
//     }));
    
//     // Compile model
//     model.compile({
//       optimizer: tf.train.adam(0.001),
//       loss: 'binaryCrossentropy',
//       metrics: ['accuracy']
//     });
    
//     // Train model
//     console.log("Starting model training...");
    
//     const startTime = Date.now();
    
//     await model.fit(trainXs, trainYs, {
//       epochs: 15, // Reduced epochs for faster training
//       batchSize: 32,
//       validationData: [valXs, valYs],
//       callbacks: {
//         onEpochEnd: (epoch, logs) => {
//           console.log(`Epoch ${epoch+1}/15 - loss: ${logs.loss.toFixed(4)} - accuracy: ${logs.acc.toFixed(4)} - val_loss: ${logs.val_loss.toFixed(4)} - val_acc: ${logs.val_acc.toFixed(4)}`);
//         }
//       }
//     });
    
//     const trainingTime = (Date.now() - startTime) / 1000;
//     console.log(`Model training completed in ${trainingTime.toFixed(2)} seconds`);
    
//     // Clean up tensors
//     trainXs.dispose();
//     trainYs.dispose();
//     valXs.dispose();
//     valYs.dispose();
    
//     return model;
//   }

//   /**
//    * Prepare tensors for training
//    */
//   prepareTrainingTensors(data) {
//     // Extract features and labels
//     const xsData = data.map(d => Object.values(d.features));
//     const ysData = data.map(d => Object.values(d.labels));
    
//     // Create tensors
//     const xs = tf.tensor2d(xsData);
//     const ys = tf.tensor2d(ysData);
    
//     return { xs, ys };
//   }

//   /**
//    * Generate recommendations based on current sensor data
//    */
//   generateRecommendations(currentDayPlan, sensorData) {
//     if (!this.initialized || !this.model || !currentDayPlan || !sensorData) {
//       console.warn("ML system not initialized or missing required data");
//       return [];
//     }
    
//     try {
//       // Convert sensor data to the format expected by the model
//       const readings = {
//         soilTemp: sensorData.soilTemp,
//         soilMoisture: sensorData.soilMoisture,
//         pH: sensorData.pH,
//         ec: sensorData.ec,
//         nitrogen: sensorData.nitrogen,
//         phosphorus: sensorData.phosphorus,
//         potassium: sensorData.potassium
//       };
      
//       // Calculate deviations from ideal values
//       const idealValues = {
//         soilTemp: currentDayPlan.soilTemp,
//         soilMoisture: currentDayPlan.soilMoisture,
//         pH: currentDayPlan.pH,
//         ec: currentDayPlan.ec,
//         nitrogen: currentDayPlan.nitrogen,
//         phosphorus: currentDayPlan.phosphorus,
//         potassium: currentDayPlan.potassium
//       };
      
//       const deviations = this.calculateDeviations(readings, idealValues);
      
//       // Create feature vector for prediction
//       const features = this.createFeatureVectorForPrediction(
//         currentDayPlan, 
//         readings, 
//         deviations
//       );
      
//       // Make prediction
//       const inputTensor = tf.tensor2d([Object.values(features)]);
//       const prediction = this.model.predict(inputTensor);
//       const resultArray = prediction.arraySync()[0];
      
//       // Clean up tensors
//       inputTensor.dispose();
//       prediction.dispose();
      
//       // Convert prediction to recommendations
//       const recommendations = this.convertPredictionToRecommendations(
//         resultArray,
//         readings,
//         idealValues
//       );
      
//       return recommendations;
//     } catch (error) {
//       console.error("Error generating ML recommendations:", error);
//       return [];
//     }
//   }

//   /**
//    * Create feature vector for prediction
//    */
//   createFeatureVectorForPrediction(currentDayPlan, readings, deviations) {
//     // Create the same feature vector as used during training
//     const features = {};
    
//     // Normalize day
//     features.day = (currentDayPlan.day - this.datasetStats.day.min) / 
//                   (this.datasetStats.day.max - this.datasetStats.day.min);
    
//     // Normalize current readings
//     features.soil_temp = (readings.soilTemp - this.datasetStats.soilTemp.min) / 
//                          (this.datasetStats.soilTemp.max - this.datasetStats.soilTemp.min);
    
//     features.soil_moisture = (readings.soilMoisture - this.datasetStats.soilMoisture.min) / 
//                             (this.datasetStats.soilMoisture.max - this.datasetStats.soilMoisture.min);
    
//     features.ph = (readings.pH - this.datasetStats.pH.min) / 
//                  (this.datasetStats.pH.max - this.datasetStats.pH.min);
    
//     features.ec = (readings.ec - this.datasetStats.ec.min) / 
//                  (this.datasetStats.ec.max - this.datasetStats.ec.min);
    
//     features.nitrogen = (readings.nitrogen - this.datasetStats.nitrogen.min) / 
//                        (this.datasetStats.nitrogen.max - this.datasetStats.nitrogen.min);
    
//     features.phosphorus = (readings.phosphorus - this.datasetStats.phosphorus.min) / 
//                          (this.datasetStats.phosphorus.max - this.datasetStats.phosphorus.min);
    
//     features.potassium = (readings.potassium - this.datasetStats.potassium.min) / 
//                         (this.datasetStats.potassium.max - this.datasetStats.potassium.min);
    
//     // Normalize deviations
//     features.soil_temp_dev = deviations.soilTemp.absolute / 10;
//     features.soil_moisture_dev = deviations.soilMoisture.absolute / 20;
//     features.ph_dev = deviations.pH.absolute / 2;
//     features.ec_dev = deviations.ec.absolute / 500;
//     features.nitrogen_dev = deviations.nitrogen.absolute / 100;
//     features.phosphorus_dev = deviations.phosphorus.absolute / 30;
//     features.potassium_dev = deviations.potassium.absolute / 100;
    
//     // One-hot encode categorical features
    
//     // Crop type
//     this.cropTypes.forEach(crop => {
//       features[`crop_${crop.toLowerCase()}`] = currentDayPlan.crop === crop ? 1 : 0;
//     });
    
//     // Growth stage
//     this.growthStages.forEach(stage => {
//       const stageKey = stage.toLowerCase().replace(/\s+/g, '_');
//       features[`stage_${stageKey}`] = currentDayPlan.growthStage === stage ? 1 : 0;
//     });
    
//     // Land type
//     this.landTypes.forEach(land => {
//       const landKey = land.toLowerCase().replace(/\s+/g, '_');
//       features[`land_${landKey}`] = currentDayPlan.landType === land ? 1 : 0;
//     });
    
//     return features;
//   }

//   /**
//    * Convert model prediction to actionable recommendations
//    */
//   convertPredictionToRecommendations(prediction, readings, idealValues) {
//     const recommendations = [];
    
//     // Map of parameters to their indices in the prediction array
//     const parameterIndices = {
//       'soilTemp': 0,
//       'soilMoisture': 2,
//       'pH': 4,
//       'ec': 6,
//       'nitrogen': 8,
//       'phosphorus': 10,
//       'potassium': 12
//     };
    
//     // Map of parameters to their display names
//     const parameterNames = {
//       'soilTemp': 'Soil Temperature',
//       'soilMoisture': 'Soil Moisture',
//       'pH': 'pH',
//       'ec': 'EC',
//       'nitrogen': 'Nitrogen',
//       'phosphorus': 'Phosphorus',
//       'potassium': 'Potassium'
//     };
    
//     // Map of parameters to their units
//     const parameterUnits = {
//       'soilTemp': '°C',
//       'soilMoisture': '%',
//       'pH': '',
//       'ec': 'µS/cm',
//       'nitrogen': 'mg/kg',
//       'phosphorus': 'mg/kg',
//       'potassium': 'mg/kg'
//     };
    
//     // Check prediction for each parameter
//     Object.keys(parameterIndices).forEach(param => {
//       const needsAdjustmentIdx = parameterIndices[param];
//       const adjustmentTypeIdx = needsAdjustmentIdx + 1;
      
//       // Threshold for considering an adjustment is needed (confidence level)
//       const confidenceThreshold = 0.6;
      
//       if (prediction[needsAdjustmentIdx] > confidenceThreshold) {
//         const paramName = parameterNames[param];
//         const paramUnit = parameterUnits[param];
//         const isIncrease = prediction[adjustmentTypeIdx] > 0.5;
        
//         // Get the actual and target values
//         const actualValue = readings[param];
//         const targetValue = idealValues[param];
        
//         // Format the values as strings with units
//         const currentValueStr = actualValue.toFixed(param === 'pH' ? 1 : 0) + paramUnit;
//         const targetValueStr = targetValue.toFixed(param === 'pH' ? 1 : 0) + paramUnit;
        
//         // Generate appropriate action text
//         let actionText = '';
        
//         if (param === 'soilTemp') {
//           actionText = isIncrease 
//             ? "Temperature is too low. Consider using black plastic mulch to increase soil temperature."
//             : "Temperature is too high. Consider adding mulch or providing shade to reduce soil temperature.";
//         } else if (param === 'soilMoisture') {
//           actionText = isIncrease 
//             ? "Soil is too dry. Increase watering frequency or adjust irrigation system."
//             : "Soil is too wet. Reduce watering frequency and ensure proper drainage.";
//         } else if (param === 'pH') {
//           actionText = isIncrease 
//             ? "pH is too low. Consider adding lime or dolomite to raise pH."
//             : "pH is too high. Consider adding sulfur or acidic organic matter to lower pH.";
//         } else if (param === 'ec') {
//           actionText = isIncrease 
//             ? "EC is too low. Consider adding a balanced fertilizer to increase nutrient availability."
//             : "EC is too high. Consider leaching the soil with pure water to reduce salt concentration.";
//         } else if (param === 'nitrogen') {
//           actionText = isIncrease 
//             ? "Nitrogen is low. Apply nitrogen-rich fertilizer."
//             : "Nitrogen is high. Reduce nitrogen fertilization.";
//         } else if (param === 'phosphorus') {
//           actionText = isIncrease 
//             ? "Phosphorus is low. Apply phosphorus-rich fertilizer."
//             : "Phosphorus is high. Reduce phosphorus fertilization.";
//         } else if (param === 'potassium') {
//           actionText = isIncrease 
//             ? "Potassium is low. Apply potassium-rich fertilizer."
//             : "Potassium is high. Reduce potassium fertilization.";
//         }
        
//         // Add recommendation
//         recommendations.push({
//           parameter: paramName,
//           current: currentValueStr,
//           target: targetValueStr,
//           action: actionText,
//           confidence: (prediction[needsAdjustmentIdx] * 100).toFixed(0) + '%'
//         });
//       }
//     });
    
//     // Sort recommendations by confidence (highest first)
//     recommendations.sort((a, b) => {
//       return parseFloat(b.confidence) - parseFloat(a.confidence);
//     });
    
//     return recommendations;
//   }
// }

// // Utility function to create a singleton instance
// let mlSystemInstance = null;

// export const getMLSystem = async () => {
//   if (!mlSystemInstance) {
//     mlSystemInstance = new CropRecommendationML();
//     await mlSystemInstance.initialize();
//   }
//   return mlSystemInstance;
// };

// /**
//  * Get ideal parameter ranges based on growth stage and land type
//  * 
//  * @param {String} growthStage - Current growth stage (Seedling, Vegetative, Flowering, etc.)
//  * @param {String} landType - Selected land type (Dry land, Coastal land, Malnad region)
//  * @returns {Object} - Object containing ideal ranges for all parameters
//  */
// export const getIdealRanges = (growthStage, landType) => {
//   // Base ranges for different growth stages
//   const baseRanges = {
//       "Seedling": {
//           soilTemp: "20-25°C",
//           soilMoisture: "65-75%",
//           pH: "6.0-6.5",
//           ec: "800-1000 µS/cm",
//           nitrogen: "120-150 mg/kg",
//           phosphorus: "30-45 mg/kg",
//           potassium: "150-180 mg/kg"
//       },
//       "Vegetative": {
//           soilTemp: "20-26°C",
//           soilMoisture: "60-70%",
//           pH: "6.0-6.5",
//           ec: "1000-1200 µS/cm",
//           nitrogen: "150-180 mg/kg",
//           phosphorus: "35-50 mg/kg",
//           potassium: "160-200 mg/kg"
//       },
//       "Flowering": {
//           soilTemp: "20-24°C",
//           soilMoisture: "60-70%",
//           pH: "6.0-6.8",
//           ec: "1200-1400 µS/cm",
//           nitrogen: "120-150 mg/kg",
//           phosphorus: "45-60 mg/kg",
//           potassium: "180-220 mg/kg"
//       },
//       "Fruiting": {
//           soilTemp: "20-26°C",
//           soilMoisture: "55-65%",
//           pH: "6.0-6.5",
//           ec: "1300-1600 µS/cm",
//           nitrogen: "100-130 mg/kg",
//           phosphorus: "40-60 mg/kg",
//           potassium: "200-250 mg/kg"
//       },
//       "Ripening": {
//           soilTemp: "18-24°C",
//           soilMoisture: "50-60%",
//           pH: "6.0-6.8",
//           ec: "1000-1300 µS/cm",
//           nitrogen: "80-110 mg/kg",
//           phosphorus: "35-55 mg/kg",
//           potassium: "180-230 mg/kg"
//       }
//   };

//   // Adjust ranges based on land type
//   const adjustedRanges = { ...baseRanges[growthStage] };

//   if (landType === "Dry land") {
//       // Adjust for dry land conditions (higher temperature, lower moisture)
//       adjustedRanges.soilTemp = `${parseInt(adjustedRanges.soilTemp.split('-')[0]) + 2}-${parseInt(adjustedRanges.soilTemp.split('-')[1]) + 2}°C`;
//       adjustedRanges.soilMoisture = `${parseInt(adjustedRanges.soilMoisture.split('-')[0]) - 10}-${parseInt(adjustedRanges.soilMoisture.split('-')[1]) - 5}%`;
//   } else if (landType === "Coastal land") {
//       // Adjust for coastal conditions (higher moisture, higher EC)
//       adjustedRanges.soilMoisture = `${parseInt(adjustedRanges.soilMoisture.split('-')[0]) + 5}-${parseInt(adjustedRanges.soilMoisture.split('-')[1]) + 5}%`;
//       adjustedRanges.ec = `${parseInt(adjustedRanges.ec.split('-')[0]) + 100}-${parseInt(adjustedRanges.ec.split('-')[1]) + 100} µS/cm`;
//   } else if (landType === "Malnad region") {
//       // Adjust for Malnad conditions (lower temperature, higher moisture, lower pH)
//       adjustedRanges.soilTemp = `${parseInt(adjustedRanges.soilTemp.split('-')[0]) - 2}-${parseInt(adjustedRanges.soilTemp.split('-')[1]) - 2}°C`;
//       adjustedRanges.soilMoisture = `${parseInt(adjustedRanges.soilMoisture.split('-')[0]) + 10}-${parseInt(adjustedRanges.soilMoisture.split('-')[1]) + 10}%`;
//       adjustedRanges.pH = `${parseFloat(adjustedRanges.pH.split('-')[0]) - 0.5}-${parseFloat(adjustedRanges.pH.split('-')[1]) - 0.3}`;
//   }

//   return adjustedRanges;
// };

// /**
//  * Parse CSV data into usable format
//  * This now generates synthetic data for all crops
//  * 
//  * @returns {Object} - Object containing parsed data and metadata
//  */
// export const parseCSVData = () => {
//   // Four crop types as specified
//   const cropTypes = ["Tomato", "Brinjal", "Capsicum", "Potato"];
//   // Specified land types
//   const landTypes = ["Dry land", "Coastal land", "Malnad region"];
//   const growthStages = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Ripening"];

//   // Generate sample dataset that would be parsed from your CSV
//   const generateData = () => {
//       const data = [];
//       for (let day = 1; day <= 120; day++) { // Updated to 120 days
//           for (const crop of cropTypes) {
//               for (const landType of landTypes) {
//                   // Determine growth stage based on day (adjusted for 120 days)
//                   let growthStage;
//                   if (day <= 20) growthStage = "Seedling";          // Days 1-20
//                   else if (day <= 45) growthStage = "Vegetative";   // Days 21-45
//                   else if (day <= 75) growthStage = "Flowering";    // Days 46-75
//                   else if (day <= 100) growthStage = "Fruiting";    // Days 76-100
//                   else growthStage = "Ripening";                    // Days 101-120

//                   // Generate values based on crop type and land type
//                   let soilTemp, soilMoisture, pH, ec, nitrogen, phosphorus, potassium;

//                   if (crop === "Tomato") {
//                       if (landType === "Dry land") {
//                           soilTemp = 22 + Math.random() * 8; // 22-30°C
//                           soilMoisture = 45 + Math.random() * 15; // 45-60%
//                           pH = 6.2 + Math.random() * 1.0; // 6.2-7.2
//                           ec = 900 + Math.random() * 700; // 900-1600 µS/cm
//                           nitrogen = 90 + Math.random() * 80; // 90-170 mg/kg
//                           phosphorus = 25 + Math.random() * 30; // 25-55 mg/kg
//                           potassium = 140 + Math.random() * 90; // 140-230 mg/kg
//                       } else if (landType === "Coastal land") {
//                           soilTemp = 20 + Math.random() * 7; // 20-27°C
//                           soilMoisture = 60 + Math.random() * 15; // 60-75%
//                           pH = 5.9 + Math.random() * 1.0; // 5.9-6.9
//                           ec = 1000 + Math.random() * 800; // 1000-1800 µS/cm
//                           nitrogen = 110 + Math.random() * 90; // 110-200 mg/kg
//                           phosphorus = 30 + Math.random() * 25; // 30-55 mg/kg
//                           potassium = 160 + Math.random() * 90; // 160-250 mg/kg
//                       } else { // Malnad region
//                           soilTemp = 18 + Math.random() * 7; // 18-25°C
//                           soilMoisture = 65 + Math.random() * 20; // 65-85%
//                           pH = 5.5 + Math.random() * 1.0; // 5.5-6.5
//                           ec = 800 + Math.random() * 600; // 800-1400 µS/cm
//                           nitrogen = 120 + Math.random() * 80; // 120-200 mg/kg
//                           phosphorus = 35 + Math.random() * 25; // 35-60 mg/kg
//                           potassium = 170 + Math.random() * 80; // 170-250 mg/kg
//                       }
//                   } else if (crop === "Brinjal") {
//                       if (landType === "Dry land") {
//                           soilTemp = 24 + Math.random() * 7; // 24-31°C
//                           soilMoisture = 50 + Math.random() * 15; // 50-65%
//                           pH = 6.0 + Math.random() * 1.0; // 6.0-7.0
//                           ec = 1000 + Math.random() * 700; // 1000-1700 µS/cm
//                           nitrogen = 100 + Math.random() * 90; // 100-190 mg/kg
//                           phosphorus = 30 + Math.random() * 25; // 30-55 mg/kg
//                           potassium = 150 + Math.random() * 90; // 150-240 mg/kg
//                       } else if (landType === "Coastal land") {
//                           soilTemp = 22 + Math.random() * 7; // 22-29°C
//                           soilMoisture = 65 + Math.random() * 15; // 65-80%
//                           pH = 5.8 + Math.random() * 1.0; // 5.8-6.8
//                           ec = 1200 + Math.random() * 700; // 1200-1900 µS/cm
//                           nitrogen = 120 + Math.random() * 90; // 120-210 mg/kg
//                           phosphorus = 35 + Math.random() * 25; // 35-60 mg/kg
//                           potassium = 170 + Math.random() * 90; // 170-260 mg/kg
//                       } else { // Malnad region
//                           soilTemp = 20 + Math.random() * 7; // 20-27°C
//                           soilMoisture = 70 + Math.random() * 15; // 70-85%
//                           pH = 5.5 + Math.random() * 1.0; // 5.5-6.5
//                           ec = 1000 + Math.random() * 600; // 1000-1600 µS/cm
//                           nitrogen = 140 + Math.random() * 80; // 140-220 mg/kg
//                           phosphorus = 40 + Math.random() * 25; // 40-65 mg/kg
//                           potassium = 180 + Math.random() * 90; // 180-270 mg/kg
//                       }
//                   } else if (crop === "Capsicum") {
//                       if (landType === "Dry land") {
//                           soilTemp = 22 + Math.random() * 7; // 22-29°C
//                           soilMoisture = 50 + Math.random() * 15; // 50-65%
//                           pH = 6.0 + Math.random() * 1.0; // 6.0-7.0
//                           ec = 1000 + Math.random() * 600; // 1000-1600 µS/cm
//                           nitrogen = 100 + Math.random() * 80; // 100-180 mg/kg
//                           phosphorus = 30 + Math.random() * 20; // 30-50 mg/kg
//                           potassium = 150 + Math.random() * 80; // 150-230 mg/kg
//                       } else if (landType === "Coastal land") {
//                           soilTemp = 20 + Math.random() * 7; // 20-27°C
//                           soilMoisture = 60 + Math.random() * 15; // 60-75%
//                           pH = 5.8 + Math.random() * 1.0; // 5.8-6.8
//                           ec = 1100 + Math.random() * 600; // 1100-1700 µS/cm
//                           nitrogen = 120 + Math.random() * 80; // 120-200 mg/kg
//                           phosphorus = 35 + Math.random() * 20; // 35-55 mg/kg
//                           potassium = 160 + Math.random() * 80; // 160-240 mg/kg
//                       } else { // Malnad region
//                           soilTemp = 18 + Math.random() * 7; // 18-25°C
//                           soilMoisture = 65 + Math.random() * 15; // 65-80%
//                           pH = 5.5 + Math.random() * 1.0; // 5.5-6.5
//                           ec = 900 + Math.random() * 600; // 900-1500 µS/cm
//                           nitrogen = 130 + Math.random() * 80; // 130-210 mg/kg
//                           phosphorus = 40 + Math.random() * 20; // 40-60 mg/kg
//                           potassium = 170 + Math.random() * 80; // 170-250 mg/kg
//                       }
//                   } else { // Potato
//                       if (landType === "Dry land") {
//                           soilTemp = 18 + Math.random() * 7; // 18-25°C
//                           soilMoisture = 55 + Math.random() * 15; // 55-70%
//                           pH = 5.8 + Math.random() * 0.7; // 5.8-6.5
//                           ec = 900 + Math.random() * 600; // 900-1500 µS/cm
//                           nitrogen = 100 + Math.random() * 70; // 100-170 mg/kg
//                           phosphorus = 35 + Math.random() * 25; // 35-60 mg/kg
//                           potassium = 170 + Math.random() * 80; // 170-250 mg/kg
//                       } else if (landType === "Coastal land") {
//                           soilTemp = 16 + Math.random() * 7; // 16-23°C
//                           soilMoisture = 65 + Math.random() * 15; // 65-80%
//                           pH = 5.5 + Math.random() * 0.8; // 5.5-6.3
//                           ec = 1000 + Math.random() * 600; // 1000-1600 µS/cm
//                           nitrogen = 120 + Math.random() * 70; // 120-190 mg/kg
//                           phosphorus = 40 + Math.random() * 25; // 40-65 mg/kg
//                           potassium = 190 + Math.random() * 80; // 190-270 mg/kg
//                       } else { // Malnad region
//                           soilTemp = 14 + Math.random() * 7; // 14-21°C
//                           soilMoisture = 70 + Math.random() * 15; // 70-85%
//                           pH = 5.2 + Math.random() * 0.8; // 5.2-6.0
//                           ec = 800 + Math.random() * 600; // 800-1400 µS/cm
//                           nitrogen = 130 + Math.random() * 70; // 130-200 mg/kg
//                           phosphorus = 45 + Math.random() * 25; // 45-70 mg/kg
//                           potassium = 200 + Math.random() * 90; // 200-290 mg/kg
//                       }
//                   }

//                   data.push({
//                       day,
//                       crop,
//                       growthStage,
//                       landType,
//                       soilTemp,
//                       soilMoisture,
//                       pH,
//                       ec,
//                       nitrogen,
//                       phosphorus,
//                       potassium,
//                       notes: ""
//                   });
//               }
//           }
//       }
//       return data;
//   };

//   return {
//       data: generateData(),
//       cropTypes,
//       landTypes,
//       growthStages
//   };
// };

// // Updated generateRecommendations function to use ML model
// export const generateRecommendations = async (currentDayPlan, liveData) => {
//   if (!currentDayPlan || !liveData) return [];
  
//   try {
//     // Get ML system instance
//     const mlSystem = await getMLSystem();
    
//     // Generate recommendations using ML
//     const mlRecommendations = mlSystem.generateRecommendations(currentDayPlan, liveData);
    
//     // If ML recommendations are available, use them
//     if (mlRecommendations && mlRecommendations.length > 0) {
//       return mlRecommendations;
//     }
    
//     // Fallback to rule-based recommendations if ML fails
//     return generateRuleBasedRecommendations(currentDayPlan, liveData);
//   } catch (error) {
//     console.error("Error generating ML recommendations:", error);
    
//     // Fallback to rule-based recommendations
//     return generateRuleBasedRecommendations(currentDayPlan, liveData);
//   }
// };

// // Original rule-based recommendation function as fallback
// const generateRuleBasedRecommendations = (currentDayPlan, liveData) => {
//   const recommendations = [];

//   // Check soil temperature
//   const tempDiff = liveData.soilTemp - currentDayPlan.soilTemp;
//   if (Math.abs(tempDiff) > 2) {
//     if (tempDiff > 0) {
//       recommendations.push({
//         parameter: "Soil Temperature",
//         current: liveData.soilTemp.toFixed(1) + "°C",
//         target: currentDayPlan.soilTemp.toFixed(1) + "°C",
//         action: "Temperature is too high. Consider adding mulch or providing shade to reduce soil temperature."
//       });
//     } else {
//       recommendations.push({
//         parameter: "Soil Temperature",
//         current: liveData.soilTemp.toFixed(1) + "°C",
//         target: currentDayPlan.soilTemp.toFixed(1) + "°C",
//         action: "Temperature is too low. Consider using black plastic mulch to increase soil temperature."
//       });
//     }
//   }

//   // Check soil moisture
//   const moistureDiff = liveData.soilMoisture - currentDayPlan.soilMoisture;
//   if (Math.abs(moistureDiff) > 5) {
//     if (moistureDiff > 0) {
//       recommendations.push({
//         parameter: "Soil Moisture",
//         current: liveData.soilMoisture.toFixed(1) + "%",
//         target: currentDayPlan.soilMoisture.toFixed(1) + "%",
//         action: "Soil is too wet. Reduce watering frequency and ensure proper drainage."
//       });
//     } else {
//       recommendations.push({
//         parameter: "Soil Moisture",
//         current: liveData.soilMoisture.toFixed(1) + "%",
//         target: currentDayPlan.soilMoisture.toFixed(1) + "%",
//         action: "Soil is too dry. Increase watering frequency or adjust irrigation system."
//       });
//     }
//   }

//   // Check pH
//   const phDiff = liveData.pH - currentDayPlan.pH;
//   if (Math.abs(phDiff) > 0.3) {
//     if (phDiff > 0) {
//       recommendations.push({
//         parameter: "pH",
//         current: liveData.pH.toFixed(1),
//         target: currentDayPlan.pH.toFixed(1),
//         action: "pH is too high. Consider adding sulfur or acidic organic matter to lower pH."
//       });
//     } else {
//       recommendations.push({
//         parameter: "pH",
//         current: liveData.pH.toFixed(1),
//         target: currentDayPlan.pH.toFixed(1),
//         action: "pH is too low. Consider adding lime or dolomite to raise pH."
//       });
//     }
//   }

//   // Check EC
//   const ecDiff = liveData.ec - currentDayPlan.ec;
//   if (Math.abs(ecDiff) > 100) {
//     if (ecDiff > 0) {
//       recommendations.push({
//         parameter: "EC",
//         current: liveData.ec.toFixed(0) + " µS/cm",
//         target: currentDayPlan.ec.toFixed(0) + " µS/cm",
//         action: "EC is too high. Consider leaching the soil with pure water to reduce salt concentration."
//       });
//     } else {
//       recommendations.push({
//         parameter: "EC",
//         current: liveData.ec.toFixed(0) + " µS/cm",
//         target: currentDayPlan.ec.toFixed(0) + " µS/cm",
//         action: "EC is too low. Consider adding a balanced fertilizer to increase nutrient availability."
//       });
//     }
//   }

//   // Check NPK
//   if (Math.abs(liveData.nitrogen - currentDayPlan.nitrogen) > 20) {
//     recommendations.push({
//       parameter: "Nitrogen",
//       current: liveData.nitrogen.toFixed(0) + " mg/kg",
//       target: currentDayPlan.nitrogen.toFixed(0) + " mg/kg",
//       action: liveData.nitrogen < currentDayPlan.nitrogen
//         ? "Nitrogen is low. Apply nitrogen-rich fertilizer."
//         : "Nitrogen is high. Reduce nitrogen fertilization."
//     });
//   }

//   if (Math.abs(liveData.phosphorus - currentDayPlan.phosphorus) > 10) {
//     recommendations.push({
//       parameter: "Phosphorus",
//       current: liveData.phosphorus.toFixed(0) + " mg/kg",
//       target: currentDayPlan.phosphorus.toFixed(0) + " mg/kg",
//       action: liveData.phosphorus < currentDayPlan.phosphorus
//         ? "Phosphorus is low. Apply phosphorus-rich fertilizer."
//         : "Phosphorus is high. Reduce phosphorus fertilization."
//     });
//   }

//   if (Math.abs(liveData.potassium - currentDayPlan.potassium) > 20) {
//     recommendations.push({
//       parameter: "Potassium",
//       current: liveData.potassium.toFixed(0) + " mg/kg",
//       target: currentDayPlan.potassium.toFixed(0) + " mg/kg",
//       action: liveData.potassium < currentDayPlan.potassium
//         ? "Potassium is low. Apply potassium-rich fertilizer."
//         : "Potassium is high. Reduce potassium fertilization."
//     });
//   }

//   return recommendations;
// };

// /**
//  * Export data to CSV format
//  * 
//  * @param {Array} data - Array of data objects to export
//  * @returns {String} - CSV formatted string
//  */
// export const exportToCSV = (data) => {
//   if (!data || !data.length) return '';

//   // Get headers from first object
//   const headers = Object.keys(data[0]);

//   // Create CSV header row
//   const csvRows = [headers.join(',')];

//   // Add data rows
//   for (const row of data) {
//     const values = headers.map(header => {
//       const value = row[header];
//       // Format values appropriately
//       if (typeof value === 'number') {
//           if (Number.isInteger(value)) {
//               return value;
//           } else {
//               return value.toFixed(1);
//           }
//       }
//       // Escape strings with quotes if they contain commas
//       if (typeof value === 'string' && value.includes(',')) {
//           return `"${value}"`;
//       }
//       return value;
//     });
//     csvRows.push(values.join(','));
//   }

//   return csvRows.join('\n');
// };

// /**
//  * Get recommendations for future days
//  * 
//  * @param {Object} currentDayPlan - The plan data for the current day
//  * @param {Object} nextDayPlan - The plan data for the next day
//  * @returns {Array} - Array of recommendation objects for future preparation
//  */
// export const getFutureDayRecommendations = (currentDayPlan, nextDayPlan) => {
//   if (!currentDayPlan || !nextDayPlan) return [];

//   const recommendations = [];

//   // Check if growth stage changes
//   if (currentDayPlan.growthStage !== nextDayPlan.growthStage) {
//       recommendations.push({
//           parameter: "Growth Stage",
//           current: currentDayPlan.growthStage,
//           target: nextDayPlan.growthStage,
//           action: `Prepare for transition to ${nextDayPlan.growthStage} stage. Adjust care routine accordingly.`
//       });
//   }

//   // Check for significant changes in soil temperature
//   const tempDiff = nextDayPlan.soilTemp - currentDayPlan.soilTemp;
//   if (Math.abs(tempDiff) > 2) {
//       recommendations.push({
//           parameter: "Soil Temperature",
//           current: currentDayPlan.soilTemp.toFixed(1) + "°C",
//           target: nextDayPlan.soilTemp.toFixed(1) + "°C",
//           action: tempDiff > 0
//               ? "Prepare to increase soil temperature for tomorrow. Consider removing some mulch or adding black plastic covers."
//               : "Prepare to decrease soil temperature for tomorrow. Consider adding shade or additional mulch layers."
//       });
//   }

//   // Check for significant changes in moisture requirements
//   const moistureDiff = nextDayPlan.soilMoisture - currentDayPlan.soilMoisture;
//   if (Math.abs(moistureDiff) > 5) {
//       recommendations.push({
//           parameter: "Soil Moisture",
//           current: currentDayPlan.soilMoisture.toFixed(1) + "%",
//           target: nextDayPlan.soilMoisture.toFixed(1) + "%",
//           action: moistureDiff > 0
//               ? "Prepare to increase irrigation for tomorrow to reach higher moisture levels."
//               : "Prepare to reduce irrigation for tomorrow as plants will require less moisture."
//       });
//   }

//   // Check for significant changes in nutrient requirements
//   const nDiff = nextDayPlan.nitrogen - currentDayPlan.nitrogen;
//   const pDiff = nextDayPlan.phosphorus - currentDayPlan.phosphorus;
//   const kDiff = nextDayPlan.potassium - currentDayPlan.potassium;

//   if (Math.abs(nDiff) > 20 || Math.abs(pDiff) > 10 || Math.abs(kDiff) > 20) {
//       recommendations.push({
//           parameter: "Nutrients (NPK)",
//           current: `${currentDayPlan.nitrogen}-${currentDayPlan.phosphorus}-${currentDayPlan.potassium}`,
//           target: `${nextDayPlan.nitrogen}-${nextDayPlan.phosphorus}-${nextDayPlan.potassium}`,
//           action: "Prepare fertilizer adjustments for tomorrow based on changing nutrient requirements."
//       });
//   }

//   return recommendations;
// };



// ML Implementation for Crop Management System Using Real Datasets
// Modified ML Implementation for Crop Management System with CPU fallback
import * as tf from '@tensorflow/tfjs';

/**
 * Main class for the Crop Recommendation ML System
 */
class CropRecommendationML {
  constructor() {
    this.model = null;
    this.datasetStats = null; // For normalization
    this.cropTypes = ["Tomato", "Brinjal", "Capsicum", "Potato"];
    this.landTypes = ["Dry land", "Coastal land", "Malnad region"];
    this.growthStages = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Ripening"];
    this.initialized = false;
    this.initializationError = null;
    this.backend = null;
  }

  /**
   * Initialize the ML system by loading and processing datasets
   */
  async initialize() {
    try {
      console.log("Initializing ML system...");
      
      // First try to set WebGL backend with a timeout
      try {
        console.log("Attempting to use WebGL backend...");
        
        // Try to set WebGL backend with a timeout
        const webglPromise = Promise.race([
          tf.setBackend('webgl'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('WebGL initialization timeout')), 5000))
        ]);
        
        await webglPromise;
        this.backend = 'webgl';
        console.log("Successfully initialized WebGL backend");
      } catch (webglError) {
        // WebGL failed, try to fall back to CPU
        console.warn(`WebGL backend failed: ${webglError.message}`);
        console.log("Falling back to CPU backend...");
        
        try {
          await tf.setBackend('cpu');
          this.backend = 'cpu';
          console.log("Successfully initialized CPU backend");
        } catch (cpuError) {
          // Both backends failed
          throw new Error(`Failed to initialize TensorFlow backends: WebGL error: ${webglError.message}, CPU error: ${cpuError.message}`);
        }
      }

      // Print which backend is being used
      console.log(`Using TensorFlow.js backend: ${tf.getBackend()}`);
      
      // Try to load a pre-trained model if available
      try {
        this.model = await tf.loadLayersModel('indexeddb://crop-recommendation-model');
        console.log("Loaded pre-trained model from storage");
        this.initialized = true;
        return true;
      } catch (e) {
        console.log("No pre-trained model found, will train a new one using synthetic data");
      }

      // Generate synthetic datasets for all crops
      const datasets = this.generateSyntheticDatasets();
      
      // Process and prepare data for training
      const { trainingData, validationData, stats } = this.prepareDataForTraining(datasets);
      this.datasetStats = stats;
      
      // Build and train the model
      this.model = await this.buildAndTrainModel(trainingData, validationData);
      
      // Save the trained model for future use
      await this.model.save('indexeddb://crop-recommendation-model');
      
      console.log("ML system initialization complete with synthetic data");
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing ML system:", error);
      this.initializationError = error.message;
      
      // Even if ML fails, we'll set a partially initialized state to not block the app
      this.initialized = true; // Still mark as initialized so the app can proceed
      return false;
    }
  }

  /**
   * Generate synthetic datasets for all crops
   */
  generateSyntheticDatasets() {
    console.log("Generating synthetic datasets for all crops");
    const datasets = {};
    
    // Use the existing parseCSVData function to generate data
    const allData = parseCSVData().data;
    
    // Split data by crop type
    this.cropTypes.forEach(cropType => {
      datasets[cropType.toLowerCase()] = allData.filter(item => item.crop === cropType);
    });
    
    console.log(`Generated synthetic datasets for ${Object.keys(datasets).length} crops`);
    return datasets;
  }

  /**
   * Prepare and process data for training
   */
  prepareDataForTraining(datasets) {
    // Combine all datasets
    let allData = [];
    Object.keys(datasets).forEach(cropType => {
      allData = allData.concat(datasets[cropType]);
    });
    
    console.log(`Total combined dataset size: ${allData.length} rows`);
    
    // Calculate statistics for normalization
    const stats = this.calculateDatasetStats(allData);
    
    // Create training examples
    const examples = this.createTrainingExamples(allData, stats);
    
    // Shuffle examples
    tf.util.shuffle(examples);
    
    // Split into training and validation sets (80/20)
    const splitIdx = Math.floor(examples.length * 0.8);
    const trainingData = examples.slice(0, splitIdx);
    const validationData = examples.slice(splitIdx);
    
    console.log(`Training set: ${trainingData.length} examples, Validation set: ${validationData.length} examples`);
    
    return { trainingData, validationData, stats };
  }

  /**
   * Calculate dataset statistics for normalization
   */
  calculateDatasetStats(data) {
    // Initialize stat trackers for numerical columns
    const stats = {
      day: { min: Infinity, max: -Infinity },
      soilTemp: { min: Infinity, max: -Infinity },
      soilMoisture: { min: Infinity, max: -Infinity },
      pH: { min: Infinity, max: -Infinity },
      ec: { min: Infinity, max: -Infinity },
      nitrogen: { min: Infinity, max: -Infinity },
      phosphorus: { min: Infinity, max: -Infinity },
      potassium: { min: Infinity, max: -Infinity }
    };
    
    // Calculate min and max for each numerical feature
    data.forEach(row => {
      Object.keys(stats).forEach(feature => {
        if (row[feature] !== undefined && row[feature] !== null) {
          stats[feature].min = Math.min(stats[feature].min, row[feature]);
          stats[feature].max = Math.max(stats[feature].max, row[feature]);
        }
      });
    });
    
    console.log("Dataset statistics for normalization:", stats);
    return stats;
  }

  /**
   * Create training examples with features and labels
   */
  createTrainingExamples(data, stats) {
    const examples = [];
    
    // Create examples by comparing each row with the ideal values
    for (let i = 0; i < data.length; i++) {
      const currentRow = data[i];
      
      // Find the ideal values for this crop, growth stage and land type
      const idealValues = this.findIdealValues(data, currentRow);
      
      if (!idealValues) continue; // Skip if no ideal values found
      
      // Create simulated "current readings" with random deviations from ideal values
      // In a real-world scenario, these would be actual sensor readings
      const simulatedReadings = this.createSimulatedReadings(idealValues);
      
      // Calculate deviations from ideal values
      const deviations = this.calculateDeviations(simulatedReadings, idealValues);
      
      // Determine if adjustments are needed based on deviations
      const adjustments = this.determineAdjustments(deviations);
      
      // Create normalized features
      const features = this.createNormalizedFeatures(
        currentRow, 
        simulatedReadings, 
        deviations, 
        stats
      );
      
      // Add example to the list
      examples.push({
        features,
        labels: adjustments
      });
    }
    
    console.log(`Created ${examples.length} training examples`);
    return examples;
  }

  /**
   * Find ideal values for a crop, growth stage and land type
   */
  findIdealValues(data, row) {
    // Get all rows matching this crop, growth stage and land type
    const matchingRows = data.filter(item => 
      item.crop === row.crop && 
      item.growthStage === row.growthStage && 
      item.landType === row.landType
    );
    
    if (matchingRows.length === 0) return null;
    
    // Calculate average values as ideal values
    const idealValues = {
      soilTemp: this.calculateAverage(matchingRows, 'soilTemp'),
      soilMoisture: this.calculateAverage(matchingRows, 'soilMoisture'),
      pH: this.calculateAverage(matchingRows, 'pH'),
      ec: this.calculateAverage(matchingRows, 'ec'),
      nitrogen: this.calculateAverage(matchingRows, 'nitrogen'),
      phosphorus: this.calculateAverage(matchingRows, 'phosphorus'),
      potassium: this.calculateAverage(matchingRows, 'potassium')
    };
    
    return idealValues;
  }

  /**
   * Calculate average value for a specific column in a dataset
   */
  calculateAverage(data, column) {
    const sum = data.reduce((acc, row) => acc + row[column], 0);
    return sum / data.length;
  }

  /**
   * Create simulated sensor readings with random deviations from ideal values
   */
  createSimulatedReadings(idealValues) {
    const readings = {};
    
    // Add random deviations to ideal values to simulate sensor readings
    readings.soilTemp = idealValues.soilTemp + (Math.random() * 6 - 3); // ±3°C
    readings.soilMoisture = idealValues.soilMoisture + (Math.random() * 20 - 10); // ±10%
    readings.pH = idealValues.pH + (Math.random() * 1 - 0.5); // ±0.5
    readings.ec = idealValues.ec + (Math.random() * 300 - 150); // ±150 µS/cm
    readings.nitrogen = idealValues.nitrogen + (Math.random() * 60 - 30); // ±30 mg/kg
    readings.phosphorus = idealValues.phosphorus + (Math.random() * 20 - 10); // ±10 mg/kg
    readings.potassium = idealValues.potassium + (Math.random() * 60 - 30); // ±30 mg/kg
    
    return readings;
  }

  /**
   * Calculate deviations between current readings and ideal values
   */
  calculateDeviations(readings, idealValues) {
    const deviations = {};
    
    Object.keys(readings).forEach(param => {
      // Calculate absolute and percentage deviations
      const absoluteDeviation = readings[param] - idealValues[param];
      const percentageDeviation = (absoluteDeviation / idealValues[param]) * 100;
      
      deviations[param] = {
        absolute: absoluteDeviation,
        percentage: percentageDeviation
      };
    });
    
    return deviations;
  }

  /**
   * Determine if adjustments are needed based on deviations
   */
  determineAdjustments(deviations) {
    // Define thresholds for adjustments (based on your original rule-based logic)
    const thresholds = {
      soilTemp: 2,
      soilMoisture: 5,
      pH: 0.3,
      ec: 100,
      nitrogen: 20,
      phosphorus: 10,
      potassium: 20
    };
    
    const adjustments = {};
    
    Object.keys(deviations).forEach(param => {
      const absDeviation = Math.abs(deviations[param].absolute);
      const needsAdjustment = absDeviation > thresholds[param];
      const adjustmentType = deviations[param].absolute > 0 ? 'decrease' : 'increase';
      
      adjustments[`needs_${param}_adjustment`] = needsAdjustment ? 1 : 0;
      adjustments[`${param}_adjustment_type`] = adjustmentType === 'increase' ? 1 : 0;
    });
    
    return adjustments;
  }

  /**
   * Create normalized feature vector
   */
  createNormalizedFeatures(row, readings, deviations, stats) {
    // Normalize numerical features
    const normalizedFeatures = {
      // Normalize day
      day: (row.day - stats.day.min) / (stats.day.max - stats.day.min),
      
      // Normalize current readings
      soil_temp: (readings.soilTemp - stats.soilTemp.min) / 
                 (stats.soilTemp.max - stats.soilTemp.min),
      soil_moisture: (readings.soilMoisture - stats.soilMoisture.min) / 
                     (stats.soilMoisture.max - stats.soilMoisture.min),
      ph: (readings.pH - stats.pH.min) / (stats.pH.max - stats.pH.min),
      ec: (readings.ec - stats.ec.min) / 
          (stats.ec.max - stats.ec.min),
      nitrogen: (readings.nitrogen - stats.nitrogen.min) / 
                (stats.nitrogen.max - stats.nitrogen.min),
      phosphorus: (readings.phosphorus - stats.phosphorus.min) / 
                  (stats.phosphorus.max - stats.phosphorus.min),
      potassium: (readings.potassium - stats.potassium.min) / 
                 (stats.potassium.max - stats.potassium.min),
      
      // Normalize absolute deviations
      soil_temp_dev: deviations.soilTemp.absolute / 10, // Assuming max deviation of ±10°C
      soil_moisture_dev: deviations.soilMoisture.absolute / 20, // Assuming max deviation of ±20%
      ph_dev: deviations.pH.absolute / 2, // Assuming max deviation of ±2
      ec_dev: deviations.ec.absolute / 500, // Assuming max deviation of ±500 µS/cm
      nitrogen_dev: deviations.nitrogen.absolute / 100, // Assuming max deviation of ±100 mg/kg
      phosphorus_dev: deviations.phosphorus.absolute / 30, // Assuming max deviation of ±30 mg/kg
      potassium_dev: deviations.potassium.absolute / 100 // Assuming max deviation of ±100 mg/kg
    };
    
    // One-hot encode categorical features
    
    // Crop type
    this.cropTypes.forEach(crop => {
      normalizedFeatures[`crop_${crop.toLowerCase()}`] = row.crop === crop ? 1 : 0;
    });
    
    // Growth stage
    this.growthStages.forEach(stage => {
      const stageKey = stage.toLowerCase().replace(/\s+/g, '_');
      normalizedFeatures[`stage_${stageKey}`] = row.growthStage === stage ? 1 : 0;
    });
    
    // Land type
    this.landTypes.forEach(land => {
      const landKey = land.toLowerCase().replace(/\s+/g, '_');
      normalizedFeatures[`land_${landKey}`] = row.landType === land ? 1 : 0;
    });
    
    return normalizedFeatures;
  }

  /**
   * Build and train the ML model
   */
  async buildAndTrainModel(trainingData, validationData) {
    // Prepare tensors for training
    const { xs: trainXs, ys: trainYs } = this.prepareTrainingTensors(trainingData);
    const { xs: valXs, ys: valYs } = this.prepareTrainingTensors(validationData);
    
    // Get input and output dimensions
    const inputDim = Object.keys(trainingData[0].features).length;
    const outputDim = Object.keys(trainingData[0].labels).length;
    
    console.log(`Building model with input dimension ${inputDim} and output dimension ${outputDim}`);
    
    // Create model architecture
    const model = tf.sequential();
    
    // Adjust model complexity based on backend
    const hiddenUnits = this.backend === 'cpu' ? 32 : 64; // Smaller model for CPU
    
    // Input layer
    model.add(tf.layers.dense({
      inputShape: [inputDim],
      units: hiddenUnits,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));
    
    // Hidden layers
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    model.add(tf.layers.dense({
      units: hiddenUnits / 2,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    // Output layer
    model.add(tf.layers.dense({
      units: outputDim,
      activation: 'sigmoid'
    }));
    
    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    // Train model with fewer epochs if using CPU backend
    const epochs = this.backend === 'cpu' ? 5 : 15;
    console.log(`Starting model training with ${epochs} epochs on ${this.backend} backend...`);
    
    const startTime = Date.now();
    
    await model.fit(trainXs, trainYs, {
      epochs: epochs,
      batchSize: this.backend === 'cpu' ? 16 : 32, // Smaller batch size for CPU
      validationData: [valXs, valYs],
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch+1}/${epochs} - loss: ${logs.loss.toFixed(4)} - accuracy: ${logs.acc.toFixed(4)} - val_loss: ${logs.val_loss.toFixed(4)} - val_acc: ${logs.val_acc.toFixed(4)}`);
        }
      }
    });
    
    const trainingTime = (Date.now() - startTime) / 1000;
    console.log(`Model training completed in ${trainingTime.toFixed(2)} seconds`);
    
    // Clean up tensors
    trainXs.dispose();
    trainYs.dispose();
    valXs.dispose();
    valYs.dispose();
    
    return model;
  }

  /**
   * Prepare tensors for training
   */
  prepareTrainingTensors(data) {
    // Extract features and labels
    const xsData = data.map(d => Object.values(d.features));
    const ysData = data.map(d => Object.values(d.labels));
    
    // Create tensors
    const xs = tf.tensor2d(xsData);
    const ys = tf.tensor2d(ysData);
    
    return { xs, ys };
  }

  /**
   * Generate recommendations based on current sensor data
   */
  generateRecommendations(currentDayPlan, sensorData) {
    if (!this.initialized) {
      console.warn("ML system not initialized");
      return [];
    }
    
    // If we don't have a model (initialization failed), fall back to rule-based recommendations
    if (!this.model) {
      console.warn("ML model not available, using rule-based recommendations");
      return generateRuleBasedRecommendations(currentDayPlan, sensorData);
    }
    
    try {
      // Convert sensor data to the format expected by the model
      const readings = {
        soilTemp: sensorData.soilTemp,
        soilMoisture: sensorData.soilMoisture,
        pH: sensorData.pH,
        ec: sensorData.ec,
        nitrogen: sensorData.nitrogen,
        phosphorus: sensorData.phosphorus,
        potassium: sensorData.potassium
      };
      
      // Calculate deviations from ideal values
      const idealValues = {
        soilTemp: currentDayPlan.soilTemp,
        soilMoisture: currentDayPlan.soilMoisture,
        pH: currentDayPlan.pH,
        ec: currentDayPlan.ec,
        nitrogen: currentDayPlan.nitrogen,
        phosphorus: currentDayPlan.phosphorus,
        potassium: currentDayPlan.potassium
      };
      
      const deviations = this.calculateDeviations(readings, idealValues);
      
      // Create feature vector for prediction
      const features = this.createFeatureVectorForPrediction(
        currentDayPlan, 
        readings, 
        deviations
      );
      
      // Make prediction
      const inputTensor = tf.tensor2d([Object.values(features)]);
      const prediction = this.model.predict(inputTensor);
      const resultArray = prediction.arraySync()[0];
      
      // Clean up tensors
      inputTensor.dispose();
      prediction.dispose();
      
      // Convert prediction to recommendations
      const recommendations = this.convertPredictionToRecommendations(
        resultArray,
        readings,
        idealValues
      );
      
      return recommendations;
    } catch (error) {
      console.error("Error generating ML recommendations:", error);
      return generateRuleBasedRecommendations(currentDayPlan, sensorData);
    }
  }

  /**
   * Create feature vector for prediction
   */
  createFeatureVectorForPrediction(currentDayPlan, readings, deviations) {
    // If datasetStats is not available, create default stats
    if (!this.datasetStats) {
      this.datasetStats = {
        day: { min: 1, max: 120 },
        soilTemp: { min: 14, max: 30 },
        soilMoisture: { min: 45, max: 85 },
        pH: { min: 5.2, max: 7.2 },
        ec: { min: 800, max: 1800 },
        nitrogen: { min: 80, max: 200 },
        phosphorus: { min: 25, max: 70 },
        potassium: { min: 140, max: 290 }
      };
    }
    
    // Create the same feature vector as used during training
    const features = {};
    
    // Normalize day
    features.day = (currentDayPlan.day - this.datasetStats.day.min) / 
                  (this.datasetStats.day.max - this.datasetStats.day.min);
    
    // Normalize current readings
    features.soil_temp = (readings.soilTemp - this.datasetStats.soilTemp.min) / 
                         (this.datasetStats.soilTemp.max - this.datasetStats.soilTemp.min);
    
    features.soil_moisture = (readings.soilMoisture - this.datasetStats.soilMoisture.min) / 
                            (this.datasetStats.soilMoisture.max - this.datasetStats.soilMoisture.min);
    
    features.ph = (readings.pH - this.datasetStats.pH.min) / 
                 (this.datasetStats.pH.max - this.datasetStats.pH.min);
    
    features.ec = (readings.ec - this.datasetStats.ec.min) / 
                 (this.datasetStats.ec.max - this.datasetStats.ec.min);
    
    features.nitrogen = (readings.nitrogen - this.datasetStats.nitrogen.min) / 
                       (this.datasetStats.nitrogen.max - this.datasetStats.nitrogen.min);
    
    features.phosphorus = (readings.phosphorus - this.datasetStats.phosphorus.min) / 
                         (this.datasetStats.phosphorus.max - this.datasetStats.phosphorus.min);
    
    features.potassium = (readings.potassium - this.datasetStats.potassium.min) / 
                        (this.datasetStats.potassium.max - this.datasetStats.potassium.min);
    
    // Normalize deviations
    features.soil_temp_dev = deviations.soilTemp.absolute / 10;
    features.soil_moisture_dev = deviations.soilMoisture.absolute / 20;
    features.ph_dev = deviations.pH.absolute / 2;
    features.ec_dev = deviations.ec.absolute / 500;
    features.nitrogen_dev = deviations.nitrogen.absolute / 100;
    features.phosphorus_dev = deviations.phosphorus.absolute / 30;
    features.potassium_dev = deviations.potassium.absolute / 100;
    
    // One-hot encode categorical features
    
    // Crop type
    this.cropTypes.forEach(crop => {
      features[`crop_${crop.toLowerCase()}`] = currentDayPlan.crop === crop ? 1 : 0;
    });
    
    // Growth stage
    this.growthStages.forEach(stage => {
      const stageKey = stage.toLowerCase().replace(/\s+/g, '_');
      features[`stage_${stageKey}`] = currentDayPlan.growthStage === stage ? 1 : 0;
    });
    
    // Land type
    this.landTypes.forEach(land => {
      const landKey = land.toLowerCase().replace(/\s+/g, '_');
      features[`land_${landKey}`] = currentDayPlan.landType === land ? 1 : 0;
    });
    
    return features;
  }

  /**
   * Convert model prediction to actionable recommendations
   */
  convertPredictionToRecommendations(prediction, readings, idealValues) {
    const recommendations = [];
    
    // Map of parameters to their indices in the prediction array
    const parameterIndices = {
      'soilTemp': 0,
      'soilMoisture': 2,
      'pH': 4,
      'ec': 6,
      'nitrogen': 8,
      'phosphorus': 10,
      'potassium': 12
    };
    
    // Map of parameters to their display names
    const parameterNames = {
      'soilTemp': 'Soil Temperature',
      'soilMoisture': 'Soil Moisture',
      'pH': 'pH',
      'ec': 'EC',
      'nitrogen': 'Nitrogen',
      'phosphorus': 'Phosphorus',
      'potassium': 'Potassium'
    };
    
    // Map of parameters to their units
    const parameterUnits = {
      'soilTemp': '°C',
      'soilMoisture': '%',
      'pH': '',
      'ec': 'µS/cm',
      'nitrogen': 'mg/kg',
      'phosphorus': 'mg/kg',
      'potassium': 'mg/kg'
    };
    
    // Check prediction for each parameter
    Object.keys(parameterIndices).forEach(param => {
      const needsAdjustmentIdx = parameterIndices[param];
      const adjustmentTypeIdx = needsAdjustmentIdx + 1;
      
      // Threshold for considering an adjustment is needed (confidence level)
      const confidenceThreshold = 0.6;
      
      if (prediction[needsAdjustmentIdx] > confidenceThreshold) {
        const paramName = parameterNames[param];
        const paramUnit = parameterUnits[param];
        const isIncrease = prediction[adjustmentTypeIdx] > 0.5;
        
        // Get the actual and target values
        const actualValue = readings[param];
        const targetValue = idealValues[param];
        
        // Format the values as strings with units
        const currentValueStr = actualValue.toFixed(param === 'pH' ? 1 : 0) + paramUnit;
        const targetValueStr = targetValue.toFixed(param === 'pH' ? 1 : 0) + paramUnit;
        
        // Generate appropriate action text
        let actionText = '';
        
        if (param === 'soilTemp') {
          actionText = isIncrease 
            ? "Temperature is too low. Consider using black plastic mulch to increase soil temperature."
            : "Temperature is too high. Consider adding mulch or providing shade to reduce soil temperature.";
        } else if (param === 'soilMoisture') {
          actionText = isIncrease 
            ? "Soil is too dry. Increase watering frequency or adjust irrigation system."
            : "Soil is too wet. Reduce watering frequency and ensure proper drainage.";
        } else if (param === 'pH') {
          actionText = isIncrease 
            ? "pH is too low. Consider adding lime or dolomite to raise pH."
            : "pH is too high. Consider adding sulfur or acidic organic matter to lower pH.";
        } else if (param === 'ec') {
          actionText = isIncrease 
            ? "EC is too low. Consider adding a balanced fertilizer to increase nutrient availability."
            : "EC is too high. Consider leaching the soil with pure water to reduce salt concentration.";
        } else if (param === 'nitrogen') {
          actionText = isIncrease 
            ? "Nitrogen is low. Apply nitrogen-rich fertilizer."
            : "Nitrogen is high. Reduce nitrogen fertilization.";
        } else if (param === 'phosphorus') {
          actionText = isIncrease 
            ? "Phosphorus is low. Apply phosphorus-rich fertilizer."
            : "Phosphorus is high. Reduce phosphorus fertilization.";
        } else if (param === 'potassium') {
          actionText = isIncrease 
            ? "Potassium is low. Apply potassium-rich fertilizer."
            : "Potassium is high. Reduce potassium fertilization.";
        }
        
        // Add recommendation
        recommendations.push({
          parameter: paramName,
          current: currentValueStr,
          target: targetValueStr,
          action: actionText,
          confidence: (prediction[needsAdjustmentIdx] * 100).toFixed(0) + '%'
        });
      }
    });
    
    // Sort recommendations by confidence (highest first)
    recommendations.sort((a, b) => {
      return parseFloat(b.confidence) - parseFloat(a.confidence);
    });
    
    return recommendations;
  }
}

// Utility function to create a singleton instance
let mlSystemInstance = null;

export const getMLSystem = async () => {
  if (!mlSystemInstance) {
    mlSystemInstance = new CropRecommendationML();
    await mlSystemInstance.initialize();
  }
  return mlSystemInstance;
};

// Also need to update the App.js to not block on ML initialization
// This is the updated version of generateRecommendations that will work without ML
export const generateRecommendations = async (currentDayPlan, liveData) => {
  if (!currentDayPlan || !liveData) return [];
  
  try {
    // Get ML system instance
    const mlSystem = await getMLSystem();
    
    // Generate recommendations using ML
    const mlRecommendations = mlSystem.generateRecommendations(currentDayPlan, liveData);
    
    // If ML recommendations are available, use them
    if (mlRecommendations && mlRecommendations.length > 0) {
      return mlRecommendations;
    }
    
    // Fallback to rule-based recommendations if ML fails
    return generateRuleBasedRecommendations(currentDayPlan, liveData);
  } catch (error) {
    console.error("Error generating ML recommendations:", error);
    
    // Fallback to rule-based recommendations
    return generateRuleBasedRecommendations(currentDayPlan, liveData);
  }
};

// Original rule-based recommendation function as fallback
const generateRuleBasedRecommendations = (currentDayPlan, liveData) => {
  const recommendations = [];

  // Check soil temperature
  const tempDiff = liveData.soilTemp - currentDayPlan.soilTemp;
  if (Math.abs(tempDiff) > 2) {
    if (tempDiff > 0) {
      recommendations.push({
        parameter: "Soil Temperature",
        current: liveData.soilTemp.toFixed(1) + "°C",
        target: currentDayPlan.soilTemp.toFixed(1) + "°C",
        action: "Temperature is too high. Consider adding mulch or providing shade to reduce soil temperature."
      });
    } else {
      recommendations.push({
        parameter: "Soil Temperature",
        current: liveData.soilTemp.toFixed(1) + "°C",
        target: currentDayPlan.soilTemp.toFixed(1) + "°C",
        action: "Temperature is too low. Consider using black plastic mulch to increase soil temperature."
      });
    }
  }

  // Check soil moisture
  const moistureDiff = liveData.soilMoisture - currentDayPlan.soilMoisture;
  if (Math.abs(moistureDiff) > 5) {
    if (moistureDiff > 0) {
      recommendations.push({
        parameter: "Soil Moisture",
        current: liveData.soilMoisture.toFixed(1) + "%",
        target: currentDayPlan.soilMoisture.toFixed(1) + "%",
        action: "Soil is too wet. Reduce watering frequency and ensure proper drainage."
      });
    } else {
      recommendations.push({
        parameter: "Soil Moisture",
        current: liveData.soilMoisture.toFixed(1) + "%",
        target: currentDayPlan.soilMoisture.toFixed(1) + "%",
        action: "Soil is too dry. Increase watering frequency or adjust irrigation system."
      });
    }
  }

  // Check pH
  const phDiff = liveData.pH - currentDayPlan.pH;
  if (Math.abs(phDiff) > 0.3) {
    if (phDiff > 0) {
      recommendations.push({
        parameter: "pH",
        current: liveData.pH.toFixed(1),
        target: currentDayPlan.pH.toFixed(1),
        action: "pH is too high. Consider adding sulfur or acidic organic matter to lower pH."
      });
    } else {
      recommendations.push({
        parameter: "pH",
        current: liveData.pH.toFixed(1),
        target: currentDayPlan.pH.toFixed(1),
        action: "pH is too low. Consider adding lime or dolomite to raise pH."
      });
    }
  }

  // Check EC
  const ecDiff = liveData.ec - currentDayPlan.ec;
  if (Math.abs(ecDiff) > 100) {
    if (ecDiff > 0) {
      recommendations.push({
        parameter: "EC",
        current: liveData.ec.toFixed(0) + " µS/cm",
        target: currentDayPlan.ec.toFixed(0) + " µS/cm",
        action: "EC is too high. Consider leaching the soil with pure water to reduce salt concentration."
      });
    } else {
      recommendations.push({
        parameter: "EC",
        current: liveData.ec.toFixed(0) + " µS/cm",
        target: currentDayPlan.ec.toFixed(0) + " µS/cm",
        action: "EC is too low. Consider adding a balanced fertilizer to increase nutrient availability."
      });
    }
  }

  // Check NPK
  if (Math.abs(liveData.nitrogen - currentDayPlan.nitrogen) > 20) {
    recommendations.push({
      parameter: "Nitrogen",
      current: liveData.nitrogen.toFixed(0) + " mg/kg",
      target: currentDayPlan.nitrogen.toFixed(0) + " mg/kg",
      action: liveData.nitrogen < currentDayPlan.nitrogen
        ? "Nitrogen is low. Apply nitrogen-rich fertilizer."
        : "Nitrogen is high. Reduce nitrogen fertilization."
    });
  }

  if (Math.abs(liveData.phosphorus - currentDayPlan.phosphorus) > 10) {
    recommendations.push({
      parameter: "Phosphorus",
      current: liveData.phosphorus.toFixed(0) + " mg/kg",
      target: currentDayPlan.phosphorus.toFixed(0) + " mg/kg",
      action: liveData.phosphorus < currentDayPlan.phosphorus
        ? "Phosphorus is low. Apply phosphorus-rich fertilizer."
        : "Phosphorus is high. Reduce phosphorus fertilization."
    });
  }

  if (Math.abs(liveData.potassium - currentDayPlan.potassium) > 20) {
    recommendations.push({
      parameter: "Potassium",
      current: liveData.potassium.toFixed(0) + " mg/kg",
      target: currentDayPlan.potassium.toFixed(0) + " mg/kg",
      action: liveData.potassium < currentDayPlan.potassium
        ? "Potassium is low. Apply potassium-rich fertilizer."
        : "Potassium is high. Reduce potassium fertilization."
    });
  }

  return recommendations;
};

/**
 * Get ideal parameter ranges based on growth stage and land type
 * 
 * @param {String} growthStage - Current growth stage (Seedling, Vegetative, Flowering, etc.)
 * @param {String} landType - Selected land type (Dry land, Coastal land, Malnad region)
 * @returns {Object} - Object containing ideal ranges for all parameters
 */
export const getIdealRanges = (growthStage, landType) => {
  // Base ranges for different growth stages
  const baseRanges = {
      "Seedling": {
          soilTemp: "20-25°C",
          soilMoisture: "65-75%",
          pH: "6.0-6.5",
          ec: "800-1000 µS/cm",
          nitrogen: "120-150 mg/kg",
          phosphorus: "30-45 mg/kg",
          potassium: "150-180 mg/kg"
      },
      "Vegetative": {
          soilTemp: "20-26°C",
          soilMoisture: "60-70%",
          pH: "6.0-6.5",
          ec: "1000-1200 µS/cm",
          nitrogen: "150-180 mg/kg",
          phosphorus: "35-50 mg/kg",
          potassium: "160-200 mg/kg"
      },
      "Flowering": {
          soilTemp: "20-24°C",
          soilMoisture: "60-70%",
          pH: "6.0-6.8",
          ec: "1200-1400 µS/cm",
          nitrogen: "120-150 mg/kg",
          phosphorus: "45-60 mg/kg",
          potassium: "180-220 mg/kg"
      },
      "Fruiting": {
          soilTemp: "20-26°C",
          soilMoisture: "55-65%",
          pH: "6.0-6.5",
          ec: "1300-1600 µS/cm",
          nitrogen: "100-130 mg/kg",
          phosphorus: "40-60 mg/kg",
          potassium: "200-250 mg/kg"
      },
      "Ripening": {
          soilTemp: "18-24°C",
          soilMoisture: "50-60%",
          pH: "6.0-6.8",
          ec: "1000-1300 µS/cm",
          nitrogen: "80-110 mg/kg",
          phosphorus: "35-55 mg/kg",
          potassium: "180-230 mg/kg"
      }
  };

  // Adjust ranges based on land type
  const adjustedRanges = { ...baseRanges[growthStage] };

  if (landType === "Dry land") {
      // Adjust for dry land conditions (higher temperature, lower moisture)
      adjustedRanges.soilTemp = `${parseInt(adjustedRanges.soilTemp.split('-')[0]) + 2}-${parseInt(adjustedRanges.soilTemp.split('-')[1]) + 2}°C`;
      adjustedRanges.soilMoisture = `${parseInt(adjustedRanges.soilMoisture.split('-')[0]) - 10}-${parseInt(adjustedRanges.soilMoisture.split('-')[1]) - 5}%`;
  } else if (landType === "Coastal land") {
      // Adjust for coastal conditions (higher moisture, higher EC)
      adjustedRanges.soilMoisture = `${parseInt(adjustedRanges.soilMoisture.split('-')[0]) + 5}-${parseInt(adjustedRanges.soilMoisture.split('-')[1]) + 5}%`;
      adjustedRanges.ec = `${parseInt(adjustedRanges.ec.split('-')[0]) + 100}-${parseInt(adjustedRanges.ec.split('-')[1]) + 100} µS/cm`;
  } else if (landType === "Malnad region") {
      // Adjust for Malnad conditions (lower temperature, higher moisture, lower pH)
      adjustedRanges.soilTemp = `${parseInt(adjustedRanges.soilTemp.split('-')[0]) - 2}-${parseInt(adjustedRanges.soilTemp.split('-')[1]) - 2}°C`;
      adjustedRanges.soilMoisture = `${parseInt(adjustedRanges.soilMoisture.split('-')[0]) + 10}-${parseInt(adjustedRanges.soilMoisture.split('-')[1]) + 10}%`;
      adjustedRanges.pH = `${parseFloat(adjustedRanges.pH.split('-')[0]) - 0.5}-${parseFloat(adjustedRanges.pH.split('-')[1]) - 0.3}`;
  }

  return adjustedRanges;
};

/**
 * Parse CSV data into usable format
 * This now generates synthetic data for all crops
 * 
 * @returns {Object} - Object containing parsed data and metadata
 */
export const parseCSVData = () => {
  // Four crop types as specified
  const cropTypes = ["Tomato", "Brinjal", "Capsicum", "Potato"];
  // Specified land types
  const landTypes = ["Dry land", "Coastal land", "Malnad region"];
  const growthStages = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Ripening"];

  // Generate sample dataset that would be parsed from your CSV
  const generateData = () => {
      const data = [];
      for (let day = 1; day <= 120; day++) { // Updated to 120 days
          for (const crop of cropTypes) {
              for (const landType of landTypes) {
                  // Determine growth stage based on day (adjusted for 120 days)
                  let growthStage;
                  if (day <= 20) growthStage = "Seedling";          // Days 1-20
                  else if (day <= 45) growthStage = "Vegetative";   // Days 21-45
                  else if (day <= 75) growthStage = "Flowering";    // Days 46-75
                  else if (day <= 100) growthStage = "Fruiting";    // Days 76-100
                  else growthStage = "Ripening";                    // Days 101-120

                  // Generate values based on crop type and land type
                  let soilTemp, soilMoisture, pH, ec, nitrogen, phosphorus, potassium;

                  if (crop === "Tomato") {
                      if (landType === "Dry land") {
                          soilTemp = 22 + Math.random() * 8; // 22-30°C
                          soilMoisture = 45 + Math.random() * 15; // 45-60%
                          pH = 6.2 + Math.random() * 1.0; // 6.2-7.2
                          ec = 900 + Math.random() * 700; // 900-1600 µS/cm
                          nitrogen = 90 + Math.random() * 80; // 90-170 mg/kg
                          phosphorus = 25 + Math.random() * 30; // 25-55 mg/kg
                          potassium = 140 + Math.random() * 90; // 140-230 mg/kg
                      } else if (landType === "Coastal land") {
                          soilTemp = 20 + Math.random() * 7; // 20-27°C
                          soilMoisture = 60 + Math.random() * 15; // 60-75%
                          pH = 5.9 + Math.random() * 1.0; // 5.9-6.9
                          ec = 1000 + Math.random() * 800; // 1000-1800 µS/cm
                          nitrogen = 110 + Math.random() * 90; // 110-200 mg/kg
                          phosphorus = 30 + Math.random() * 25; // 30-55 mg/kg
                          potassium = 160 + Math.random() * 90; // 160-250 mg/kg
                      } else { // Malnad region
                          soilTemp = 18 + Math.random() * 7; // 18-25°C
                          soilMoisture = 65 + Math.random() * 20; // 65-85%
                          pH = 5.5 + Math.random() * 1.0; // 5.5-6.5
                          ec = 800 + Math.random() * 600; // 800-1400 µS/cm
                          nitrogen = 120 + Math.random() * 80; // 120-200 mg/kg
                          phosphorus = 35 + Math.random() * 25; // 35-60 mg/kg
                          potassium = 170 + Math.random() * 80; // 170-250 mg/kg
                      }
                  } else if (crop === "Brinjal") {
                      // [... Brinjal data generation remains the same ...]
                      if (landType === "Dry land") {
                          soilTemp = 24 + Math.random() * 7; // 24-31°C
                          soilMoisture = 50 + Math.random() * 15; // 50-65%
                          pH = 6.0 + Math.random() * 1.0; // 6.0-7.0
                          ec = 1000 + Math.random() * 700; // 1000-1700 µS/cm
                          nitrogen = 100 + Math.random() * 90; // 100-190 mg/kg
                          phosphorus = 30 + Math.random() * 25; // 30-55 mg/kg
                          potassium = 150 + Math.random() * 90; // 150-240 mg/kg
                      } else if (landType === "Coastal land") {
                          soilTemp = 22 + Math.random() * 7; // 22-29°C
                          soilMoisture = 65 + Math.random() * 15; // 65-80%
                          pH = 5.8 + Math.random() * 1.0; // 5.8-6.8
                          ec = 1200 + Math.random() * 700; // 1200-1900 µS/cm
                          nitrogen = 120 + Math.random() * 90; // 120-210 mg/kg
                          phosphorus = 35 + Math.random() * 25; // 35-60 mg/kg
                          potassium = 170 + Math.random() * 90; // 170-260 mg/kg
                      } else { // Malnad region
                          soilTemp = 20 + Math.random() * 7; // 20-27°C
                          soilMoisture = 70 + Math.random() * 15; // 70-85%
                          pH = 5.5 + Math.random() * 1.0; // 5.5-6.5
                          ec = 1000 + Math.random() * 600; // 1000-1600 µS/cm
                          nitrogen = 140 + Math.random() * 80; // 140-220 mg/kg
                          phosphorus = 40 + Math.random() * 25; // 40-65 mg/kg
                          potassium = 180 + Math.random() * 90; // 180-270 mg/kg
                      }
                  } else if (crop === "Capsicum") {
                      // [... Capsicum data generation remains the same ...]
                      if (landType === "Dry land") {
                          soilTemp = 22 + Math.random() * 7; // 22-29°C
                          soilMoisture = 50 + Math.random() * 15; // 50-65%
                          pH = 6.0 + Math.random() * 1.0; // 6.0-7.0
                          ec = 1000 + Math.random() * 600; // 1000-1600 µS/cm
                          nitrogen = 100 + Math.random() * 80; // 100-180 mg/kg
                          phosphorus = 30 + Math.random() * 20; // 30-50 mg/kg
                          potassium = 150 + Math.random() * 80; // 150-230 mg/kg
                      } else if (landType === "Coastal land") {
                          soilTemp = 20 + Math.random() * 7; // 20-27°C
                          soilMoisture = 60 + Math.random() * 15; // 60-75%
                          pH = 5.8 + Math.random() * 1.0; // 5.8-6.8
                          ec = 1100 + Math.random() * 600; // 1100-1700 µS/cm
                          nitrogen = 120 + Math.random() * 80; // 120-200 mg/kg
                          phosphorus = 35 + Math.random() * 20; // 35-55 mg/kg
                          potassium = 160 + Math.random() * 80; // 160-240 mg/kg
                      } else { // Malnad region
                          soilTemp = 18 + Math.random() * 7; // 18-25°C
                          soilMoisture = 65 + Math.random() * 15; // 65-80%
                          pH = 5.5 + Math.random() * 1.0; // 5.5-6.5
                          ec = 900 + Math.random() * 600; // 900-1500 µS/cm
                          nitrogen = 130 + Math.random() * 80; // 130-210 mg/kg
                          phosphorus = 40 + Math.random() * 20; // 40-60 mg/kg
                          potassium = 170 + Math.random() * 80; // 170-250 mg/kg
                      }
                  } else { // Potato
                      // [... Potato data generation remains the same ...]
                      if (landType === "Dry land") {
                          soilTemp = 18 + Math.random() * 7; // 18-25°C
                          soilMoisture = 55 + Math.random() * 15; // 55-70%
                          pH = 5.8 + Math.random() * 0.7; // 5.8-6.5
                          ec = 900 + Math.random() * 600; // 900-1500 µS/cm
                          nitrogen = 100 + Math.random() * 70; // 100-170 mg/kg
                          phosphorus = 35 + Math.random() * 25; // 35-60 mg/kg
                          potassium = 170 + Math.random() * 80; // 170-250 mg/kg
                      } else if (landType === "Coastal land") {
                          soilTemp = 16 + Math.random() * 7; // 16-23°C
                          soilMoisture = 65 + Math.random() * 15; // 65-80%
                          pH = 5.5 + Math.random() * 0.8; // 5.5-6.3
                          ec = 1000 + Math.random() * 600; // 1000-1600 µS/cm
                          nitrogen = 120 + Math.random() * 70; // 120-190 mg/kg
                          phosphorus = 40 + Math.random() * 25; // 40-65 mg/kg
                          potassium = 190 + Math.random() * 80; // 190-270 mg/kg
                      } else { // Malnad region
                          soilTemp = 14 + Math.random() * 7; // 14-21°C
                          soilMoisture = 70 + Math.random() * 15; // 70-85%
                          pH = 5.2 + Math.random() * 0.8; // 5.2-6.0
                          ec = 800 + Math.random() * 600; // 800-1400 µS/cm
                          nitrogen = 130 + Math.random() * 70; // 130-200 mg/kg
                          phosphorus = 45 + Math.random() * 25; // 45-70 mg/kg
                          potassium = 200 + Math.random() * 90; // 200-290 mg/kg
                      }
                  }

                  data.push({
                      day,
                      crop,
                      growthStage,
                      landType,
                      soilTemp,
                      soilMoisture,
                      pH,
                      ec,
                      nitrogen,
                      phosphorus,
                      potassium,
                      notes: ""
                  });
              }
          }
      }
      return data;
  };

  return {
      data: generateData(),
      cropTypes,
      landTypes,
      growthStages
  };
};

/**
 * Export data to CSV format
 * 
 * @param {Array} data - Array of data objects to export
 * @returns {String} - CSV formatted string
 */
export const exportToCSV = (data) => {
  if (!data || !data.length) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV header row
  const csvRows = [headers.join(',')];

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Format values appropriately
      if (typeof value === 'number') {
          if (Number.isInteger(value)) {
              return value;
          } else {
              return value.toFixed(1);
          }
      }
      // Escape strings with quotes if they contain commas
      if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Get recommendations for future days
 * 
 * @param {Object} currentDayPlan - The plan data for the current day
 * @param {Object} nextDayPlan - The plan data for the next day
 * @returns {Array} - Array of recommendation objects for future preparation
 */
export const getFutureDayRecommendations = (currentDayPlan, nextDayPlan) => {
  if (!currentDayPlan || !nextDayPlan) return [];

  const recommendations = [];

  // Check if growth stage changes
  if (currentDayPlan.growthStage !== nextDayPlan.growthStage) {
      recommendations.push({
          parameter: "Growth Stage",
          current: currentDayPlan.growthStage,
          target: nextDayPlan.growthStage,
          action: `Prepare for transition to ${nextDayPlan.growthStage} stage. Adjust care routine accordingly.`
      });
  }

  // Check for significant changes in soil temperature
  const tempDiff = nextDayPlan.soilTemp - currentDayPlan.soilTemp;
  if (Math.abs(tempDiff) > 2) {
      recommendations.push({
          parameter: "Soil Temperature",
          current: currentDayPlan.soilTemp.toFixed(1) + "°C",
          target: nextDayPlan.soilTemp.toFixed(1) + "°C",
          action: tempDiff > 0
              ? "Prepare to increase soil temperature for tomorrow. Consider removing some mulch or adding black plastic covers."
              : "Prepare to decrease soil temperature for tomorrow. Consider adding shade or additional mulch layers."
      });
  }

  // Check for significant changes in moisture requirements
  const moistureDiff = nextDayPlan.soilMoisture - currentDayPlan.soilMoisture;
  if (Math.abs(moistureDiff) > 5) {
      recommendations.push({
          parameter: "Soil Moisture",
          current: currentDayPlan.soilMoisture.toFixed(1) + "%",
          target: nextDayPlan.soilMoisture.toFixed(1) + "%",
          action: moistureDiff > 0
              ? "Prepare to increase irrigation for tomorrow to reach higher moisture levels."
              : "Prepare to reduce irrigation for tomorrow as plants will require less moisture."
      });
  }

  // Check for significant changes in nutrient requirements
  const nDiff = nextDayPlan.nitrogen - currentDayPlan.nitrogen;
  const pDiff = nextDayPlan.phosphorus - currentDayPlan.phosphorus;
  const kDiff = nextDayPlan.potassium - currentDayPlan.potassium;

  if (Math.abs(nDiff) > 20 || Math.abs(pDiff) > 10 || Math.abs(kDiff) > 20) {
      recommendations.push({
          parameter: "Nutrients (NPK)",
          current: `${currentDayPlan.nitrogen}-${currentDayPlan.phosphorus}-${currentDayPlan.potassium}`,
          target: `${nextDayPlan.nitrogen}-${nextDayPlan.phosphorus}-${nextDayPlan.potassium}`,
          action: "Prepare fertilizer adjustments for tomorrow based on changing nutrient requirements."
      });
  }

  return recommendations;
};