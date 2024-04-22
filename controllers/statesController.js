const State = require('../model/States');
const stateData = require('../model/statesData.json');

const getAllStates = async(req, res) => {
    const states = await State.find();
    if (!states) return res.status(204).json({'message': 'Invalid state abbreviation parameter'});
    if (req.query.contig == 'true') {
        let results = stateData.filter(state => state.admission_number != 49 && state.admission_number != 50);
        let facts = states.filter(state => state.stateCode != "ak" && state.stateCode != "hi");
        for (let i = 0; i < results.length; i++) {
            for (let j = 0; j < facts.length; j++) {
                if(results[i].code.toLowerCase() == facts[j].stateCode.toLowerCase()) {
                    results[i].funfacts = facts[j].funfacts;
                }
            }
        }
        res.json(results);
        return;
    }
    if (req.query.contig == 'false') {
        let results = stateData.filter(state => state.admission_number == 49 || state.admission_number == 50);
        let facts = states.filter(state => state.stateCode == "ak" || state.stateCode == "hi");
        for (let i = 0; i < results.length; i++) {
            for (let j = 0; i < facts.length; j++) {
                if(results[i].code.toLowerCase() == facts[j].stateCode.toLowerCase()) {
                    results[i].funfacts = facts[j].funfacts;
                }
            }
        }
        res.json(results);
        return;
    }
    else {
        let results = stateData;
        for (let i = 0; i < results.length; i++) {
            for (let j = 0; j < states.length; j++) {
                if(results[i].code.toLowerCase() == states[j].stateCode.toLowerCase()) {
                    results[i].funfacts = states[j].funfacts;
                }
            }
        }
        res.json(results);
        return;
    }
}


const createFunFact = async(req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'A state code is required' });
    }
    if (!req?.body?.funfacts) {
        res.json({ 'message': 'State fun facts value required' });
        return;
    }
    const stateInfo = stateData.filter(state => state.code.toUpperCase() == req.params.state.toUpperCase());
    if (stateInfo.length == 0) {
        res.json({ 'message': 'Invalid state abbreviation parameter' });
        return;
    }
    if (!Array.isArray(req?.body?.funfacts)) {
        res.json({ 'message': 'State fun facts value must be an array' });
        return ;
    }
    const stateFacts = await State.findOne({"stateCode": req.params.state.toUpperCase()}).exec();

    if(!stateFacts){
        const result = await State.create({
            stateCode: req.params.state.toUpperCase(),
            funfacts: req.body.funfacts
        });
        return res.json(result);
    } else {
        for(let i = 0; i < req.body.funfacts.length; i++) {
            stateFacts.funfacts.push(req.body.funfacts[i]);
        }
        const returnFact = await stateFacts.save()
        res.json(returnFact);
        return;
    }
}

const updateFunFact = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code is required.' });
    }
    if (!req?.body?.index) {
        return res.json({ 'message': 'State fun fact index value required' });
    }
    if (!req?.body?.funfact) {
        return res.json({ 'message': 'State fun fact value required' });
    }
    const stateName = stateData.filter(state => state.code.toUpperCase() == req.params.state.toUpperCase());
    if (stateName.length == 0) {
        res.json({ 'message': 'Invalid state abbreviation parameter' });
        return;
    }
    const stateFact = await State.findOne({"stateCode": req.params.state.toUpperCase()}).exec();
    if (!stateFact || !(stateFact.funfacts[req.body.index - 1])) {
        res.json({ 'message': 'No Fun Fact found at that index for ' + stateName[0].state });
        return;
    } else {
        stateFact.funfacts[req.body.index - 1] = req.body.funfact;
    }
    const result = await stateFact.save();
    res.json(result);
    return;
}

const deleteFunFact = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code is required.' });
    }
    if (!req?.body?.index) {
        return res.json({ 'message': 'State fun fact index value required' });
    }
    const stateName = stateData.filter(state => state.code.toUpperCase() == req.params.state.toUpperCase());
    if (stateName.length == 0) {
        res.json({ 'message': 'Invalid state abbreviation parameter' });
        return;
    }
    const stateFact = await State.findOne({"stateCode": req.params.state.toUpperCase()}).exec();
    if (!stateFact || !(stateFact.funfacts[req.body.index - 1])) {
        res.json({ 'message': 'No Fun Fact found at that index for ' + stateName[0].state });
        return;
    }
    stateFact.funfacts.splice(req.body.index - 1, 1);
    const result = await stateFact.save();
    res.json(result);
    return;
}

const getFunFact = async (req, res) => {
    if (!req?.params?.state) {
        return res.status(400).json({ 'message': 'State code is required.' });
    }
    const stateName = stateData.filter(state => state.code.toUpperCase() == req.params.state.toUpperCase());
    if (stateName.length == 0) {
        res.json({ 'message': 'Invalid state abbreviation parameter' });
        return;
    }
    const stateFact = await State.findOne({"stateCode": req.params.state.toUpperCase()}).exec();
    if (!stateFact || !stateFact.funfacts || stateFact.funfacts[0] == null) {
        res.json({ 'message': 'No Fun Facts found for ' + stateName[0].state });
        return;
    }
    res.json({'funfact': stateFact.funfacts[Math.floor(Math.random() * stateFact.funfacts.length)]});
    return;
}

const getState = async (req, res) => {
    const states = await State.find();
    if (!req?.params?.state) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });

    const stateFact = states.filter(state => state.stateCode.toUpperCase() == req.params.state.toUpperCase());
    const results = stateData.filter(state => state.code.toUpperCase() == req.params.state.toUpperCase());
    if (results.length == 0) {
        res.json({ 'message': 'Invalid state abbreviation parameter' });
        return;
    }
    for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < stateFact.length; j++) {
            if(results[i].code.toUpperCase() == stateFact[j].stateCode.toUpperCase()) {
                results[i].funfacts = stateFact[j].funfacts;
            }
        }
    }
    res.json(results[0]);
}

const getStateCapital = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });

    const results = stateData.filter(state => state.code.toUpperCase() == req.params.state.toUpperCase());
    if (results.length == 0) {
        res.json({ 'message': 'Invalid state abbreviation parameter' });
        return;
    }
    res.json({'state': results[0].state, 'capital': results[0].capital_city});
}

const getStateNickName = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });

    const results = stateData.filter(state => state.code.toUpperCase() == req.params.state.toUpperCase());
    if (results.length == 0) {
        res.json({ 'message': 'Invalid state abbreviation parameter' });
        return;
    }
    res.json({'state': results[0].state, 'nickname': results[0].nickname});
}

const getStatePopulation = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });

    const results = stateData.filter(state => state.code.toUpperCase() == req.params.state.toUpperCase());
    if (results.length == 0) {
        res.json({ 'message': 'Invalid state abbreviation parameter' });
        return;
    }
    res.json({'state': results[0].state, 'population': results[0].population.toLocaleString()});
}

const getStateAdmission = async (req, res) => {
    if (!req?.params?.state) return res.status(400).json({ 'message': 'Invalid state abbreviation parameter' });

    const results = stateData.filter(state => state.code.toUpperCase() == req.params.state.toUpperCase());
    if (results.length == 0) {
        res.json({ 'message': 'Invalid state abbreviation parameter' });
        return;
    }
    res.json({'state': results[0].state, 'admitted': results[0].admission_date});
}


module.exports = {
    getAllStates,
    createFunFact,
    updateFunFact,
    deleteFunFact,
    getFunFact,
    getState,
    getStateCapital,
    getStateNickName,
    getStatePopulation,
    getStateAdmission
}