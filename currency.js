class Currency {
    constructor() {

        this.url = 'https://v6.exchangerate-api.com/v6/8c58f9198e8a1a192a1c20cd/latest/';
    }
    async exchange(amount, firstCurrency, secondCurrency) {
        const response = await fetch(`${this.url}${firstCurrency}`);

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        const result = await response.json();
        const exchangedResult = amount * result.conversion_rates[secondCurrency];
        return exchangedResult;
    }
    async getRate(fromCurrency, toCurrency) {
        const response = await fetch(`${this.url}${fromCurrency}`);
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        const result = await response.json();
        const rate = result.conversion_rates[toCurrency];
        return rate;
    }
}
