// This object represent the waveform generator
var WaveformGenerator = {
    // The generateWaveform function takes 4 parameters:
    //     - type, the type of waveform to be generated
    //     - frequency, the frequency of the waveform to be generated
    //     - amp, the maximum amplitude of the waveform to be generated
    //     - duration, the length (in seconds) of the waveform to be generated
    generateWaveform: function(type, frequency, amp, duration) {
        var nyquistFrequency = sampleRate / 2; // Nyquist frequency
        var totalSamples = Math.floor(sampleRate * duration); // Number of samples to generate
        var result = []; // The temporary array for storing the generated samples

        // For square-time & sawtooth-time
        let oneCycle = sampleRate / frequency;  // Number of samples in a cycle
        let halfCycle = oneCycle / 2;

        // For square-addictive
        let maxNumberOfHarmonics = 1000; // Prevent from loading too long

        switch(type) {
            case "sine-time": // Sine wave, time domain
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    result.push(amp * Math.sin(2.0 * Math.PI * frequency * currentTime));
                }

                // // From the lecture notes
                // for (var i = 0; i < totalSamples; i++) {
                //     var t = i / sampleRate;
                //     samples[i] = Math.sin(2 * Math.PI * frequency * t);
                //  }

                break;

            case "square-time": // Square wave, time domain

                for (let i = 0 ; i < totalSamples; ++i) {
                    let whereInTheCycle = i % parseInt(oneCycle);
                    if (whereInTheCycle < halfCycle) { // First half of cycle
                        result.push(amp);
                    } else { // Second half of cycle
                        result.push(-1 * amp);
                    }
                }
                
                // // From lecture notes
                // for (var i = 0; i < sampleRate; i++) {
                //     var whereInTheCycle = i % parseInt(oneCycle);
                //     if (whereInTheCycle < halfCycle)
                //         // First half og the cycle
                //         samples[i] = 1; // Assume the highest value is 1
                //     else
                //         // second half of the cycle
                //         samples[i] = -1; // Assuem the lowest value is -1
                // }

                break;

            case "square-additive": // Square wave, additive synthesis

                for (var i = 0; i < totalSamples; i++) {
                    let t = i / sampleRate;
                    let sample = 0;
                    let k = 1;
                    let numberOfHarmonics = 0;
                    while ((k * frequency < nyquistFrequency) && (numberOfHarmonics < maxNumberOfHarmonics)) {
                        sample = sample + (4 / Math.PI) * (1.0 / k) * Math.sin(2 * Math.PI * k * frequency * t);
                        k = k + 2;
                        numberOfHarmonics++;
                    }
                    result.push(amp * sample);
                }

                // // From lecture notes
                // var totalWaves = 10; 
                // for (var i = 0; i < totalSamples; i++) { 
                //     var t = i / sampleRate; 
                //     var sample = 0;
                //     for (var k = 1; k <= totalWaves * 2; k += 2) {
                //         sample += (1.0 / k) * Math.sin(2 * Math.PI * k * frequency * t);
                //     }
                //     samples[i] = sample;
                // }
                 
                break;

            case "sawtooth-time": // Sawtooth wave, time domain

                for (var i = 0; i < totalSamples; i++) {
                    var whereInTheCycle = i % parseInt(oneCycle);
                    var fractionInTheCycle = whereInTheCycle / oneCycle;
                    result.push(amp * (2 * (1.0 - fractionInTheCycle) - 1));
                }

                // // From lecture notes
                // var oneCycle = sampleRate / frequency;
                // for (var i = 0; i < totalSamples; i++) {
                //     var whereInTheCycle = i % parseInt(oneCycle); 
                //     var fractionInTheCycle = whereInTheCycle / oneCycle;
                //     samples[i] = 2 * (1.0 - fractionInTheCycle) - 1;
                // }

                break;

            case "sawtooth-additive": // Sawtooth wave, additive synthesis

                for (var i = 0; i < totalSamples; i++) {
                    let t = i / sampleRate;
                    let sample = 0;
                    let k = 1;
                    let numberOfHarmonics = 0;
                    while ((numberOfHarmonics < maxNumberOfHarmonics) && (k * frequency < nyquistFrequency)) {
                        sample = sample + (2 / Math.PI) * (1.0 / k) * Math.sin(2 * Math.PI * k * frequency * t);
                        k = k + 1;
                        numberOfHarmonics++;
                    }
                    result.push(amp * sample);
                }

                // // From lecture notes
                // var totalWaves = 10;
                // for (var i = 0; i < totalSamples; i++) {
                //     var t = i / sampleRate;
                //     var sample = 0;
                //     for (var k = 1; k <= totalWaves; k++) {
                //         sample += (1.0 / k) * Math.sin(2 * Math.PI * k * frequency * t);
                //     }
                //     samples[i] = sample;
                // }

                break;

            case "triangle-additive": // Triangle wave, additive synthesis
                
                for (var i = 0; i < totalSamples; i++) {
                    let t = i / sampleRate;
                    let sample = 0;
                    let k = 1;
                    let numberOfHarmonics = 0;
                    while ((numberOfHarmonics < maxNumberOfHarmonics) && (k * frequency < nyquistFrequency)) {
                        sample = sample + (8 / (Math.PI * Math.PI)) * (1.0 / (k * k)) * Math.cos(2 * Math.PI * k * frequency * t);
                        k = k + 2;
                        numberOfHarmonics++;
                    }
                    result.push(amp * sample);
                }

                // // From lecture notes
                // var totalWaves = 10;
                // for (var i = 0; i < totalSamples; i++) {
                //     var t = i / sampleRate; 
                //     var sample = 0; 
                //     for (var k = 1; k <= totalWaves * 2; k += 2) {
                //         sample += (1.0 / (k * k)) * Math.cos(2 * Math.PI * k * frequency * t);
                //     }
                //     smaple[i] = sample;
                // }

                break;

            case "customized-additive-synthesis": // Customized additive synthesis

                // Obtain all the required parameters
				var harmonics = [];
				for (var h = 1; h <= 10; ++h) {
					harmonics.push($("#additive-f" + h).val());
				}

                // Generate samples
                for (let i = 0; i < totalSamples; i++) {
                    let t = i / sampleRate;
                    let sample = 0;
                    let k = 1;
                    while ((k < 11) && (k * frequency < nyquistFrequency)) {
                        sample = sample + parseFloat(harmonics[k-1]) * Math.sin(2 * Math.PI * k * frequency * t);
                        k++;
                    }
                    result.push(amp * sample);
                }

                break;

            case "white-noise": // White noise
                
                for (let i = 0; i < totalSamples; i++) {
                    let sample = Math.ceil(Math.random() * (amp+1)) * (Math.round(Math.random()) ? 1 : -1);
                    result.push(amp * sample);
                }

                break;

            case "karplus-strong": // Karplus-Strong algorithm

                // Obtain all the required parameters
                let base = $("#karplus-base>option:selected").val();
                let b = parseFloat($("#karplus-b").val());
                let delay = parseInt($("#karplus-p").val());

                // Find p from frequency
                let findPFromFreq = $("#karplus-use-freq").prop("checked");
                if (findPFromFreq) {
                    delay = parseInt(sampleRate / frequency);
                }

                // Store samples for further processing
                let samples = [];

                // Generate Samples
                for (let i = 0; i < totalSamples; ++i) {
                    if (i <= delay) {
                        if (base === "white-noise") {
                            samples[i] = Math.random() * 2 - 1;
                        } else { // Time-domain sawtooth wave
                            let whereInTheCycle = i % parseInt(oneCycle);
                            let fractionInTheCycle = whereInTheCycle / oneCycle;
                            samples[i] = 2 * (1 - fractionInTheCycle) - 1;
                        }
                    } else {
                        let sampleAfter = 0.5 * (samples[i - delay] + samples[i - delay - 1]);  
                        let randomNumber = Math.random();
                        if (randomNumber < b) {
                            samples[i] = sampleAfter;
                        } else {
                            samples[i] = -sampleAfterl;
                        }
                        result.push(amp * samples[i]);
                    }
                }
                
                // // Sawtooth wave (time domain)
                // for (var i = 0; i < totalSamples; i++) {
                //     var whereInTheCycle = i % parseInt(oneCycle);
                //     var fractionInTheCycle = whereInTheCycle / oneCycle;
                //     result.push(amp * 2 * (1.0 - fractionInTheCycle) - 1);
                // }

                break;

                

            case "fm": // FM

                // Obtain all the required parameters
                var carrierFrequency = parseFloat($("#fm-carrier-frequency").val());
                var carrierAmplitude = parseFloat($("#fm-carrier-amplitude").val());
                var modulationFrequency = parseFloat($("#fm-modulation-frequency").val());
                var modulationAmplitude = parseFloat($("#fm-modulation-amplitude").val());
                var useFreqAsMultipliers = $("#fm-use-freq-multiplier").prop("checked");
                if (useFreqAsMultipliers) { // Obtain frequency as multipliers
                    carrierFrequency = carrierFrequency * frequency;
                    modulationFrequency = modulationFrequency * frequency;
                }
                var useADSR = $("#fm-use-adsr").prop("checked");
                if(useADSR) { // Obtain the ADSR parameters
                    var attackDuration = parseFloat($("#fm-adsr-attack-duration").val()) * sampleRate;
                    var decayDuration = parseFloat($("#fm-adsr-decay-duration").val()) * sampleRate;
                    var releaseDuration = parseFloat($("#fm-adsr-release-duration").val()) * sampleRate;
                    var sustainLevel = parseFloat($("#fm-adsr-sustain-level").val()) / 100.0;
                }

                // Generate samples
                for (let i = 0; i < totalSamples; ++i) {
                    let t = i / sampleRate;
                    let modulationAmplitudeMultiplier = 1;

                    // If ADSR is used
                    if(useADSR) {
                        if (i <= attackDuration) { // Attack
                            let attactStep = i / attackDuration; 
                            modulationAmplitudeMultiplier = lerp(0, 1.0, attactStep);
                        } else if ((i > attackDuration) && (i <= (attackDuration + decayDuration))) { // Decay
                            let decayStep = (i - attackDuration) / decayDuration;
                            modulationAmplitudeMultiplier = lerp(1.0, sustainLevel, decayStep);
                        } else if ((i > (attackDuration + decayDuration)) && (i <= (totalSamples - releaseDuration))) { // Sustain
                            modulationAmplitudeMultiplier = sustainLevel;
                        } else { // Release
                            let releaseStep = (i - (totalSamples - releaseDuration)) / releaseDuration;
                            modulationAmplitudeMultiplier = lerp(sustainLevel, 0, releaseStep);
                        }
                    }

                    let modulator = modulationAmplitudeMultiplier* modulationAmplitude * Math.sin(2 * Math.PI * modulationFrequency * t);
                    result.push(amp * carrierAmplitude * Math.sin(2 * Math.PI * carrierFrequency * t + modulator));
                }

                // // Creating sine wave (time)
                // for (var i = 0; i < totalSamples; ++i) {
                //     var currentTime = i / sampleRate;
                //     result.push(amp * Math.sin(2.0 * Math.PI * frequency * currentTime));
                // }

                // // From lecture notes (FM)
                // for (var i = 0; i < totalSamples; i++) {
                //     var t = i / sampleRate;
                //     var modulator = am * Math.sin(2 * Math.PI * fm * t);
                //     samples[i] = ac * Math.sin(2 * Math.PI * fc * t + modulator);
                // }

                // // Creating ADSR
                // for(var c = 0; c < channels.length; ++c) {
                //     // Get the sample data of the channel
                //     var audioSequence = channels[c].audioSequenceReference; 
                //     for(var i = 0; i < audioSequence.data.length; ++i) {
                //         if (i <= attackDuration) { // Attack
                //             let attactStep = i / attackDuration; 
                //             audioSequence.data[i] = audioSequence.data[i] * lerp(0, 1.0, attactStep);
                //         } else if ((i > attackDuration) && (i <= (attackDuration + decayDuration))) { // Decay
                //             let decayStep = (i - attackDuration) / decayDuration;
                //             audioSequence.data[i] = audioSequence.data[i] * lerp(1.0, sustainLevel, decayStep);
                //         }  else if ((i > (attackDuration + decayDuration)) && (i <= (audioSequence.data.length - releaseDuration))) { // Sustain
                //             audioSequence.data[i] = audioSequence.data[i] * sustainLevel;
                //         } else { // Release
                //             let releaseStep = (i - (audioSequence.data.length - releaseDuration)) / releaseDuration;
                //             audioSequence.data[i] = audioSequence.data[i] * lerp(sustainLevel, 0, releaseStep);
                //         }
                //     }
                //     // Update the sample data with the post-processed data
                //     channels[c].setAudioSequence(audioSequence);

                break;

            case "repeating-narrow-pulse": // Repeating narrow pulse
                var cycle = Math.floor(sampleRate / frequency);
                for (var i = 0; i < totalSamples; ++i) {
                    if(i % cycle === 0) {
                        result.push(amp * 1.0);
                    } else if(i % cycle === 1) {
                        result.push(amp * -1.0);
                    } else {
                        result.push(0.0);
                    }
                }
                break;

            default:
                break;
        }

        return result;
    }
};
