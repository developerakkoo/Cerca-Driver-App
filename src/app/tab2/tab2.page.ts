import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  Uamount: number = 0;
  Samount: number = 0;
  settlements = [
    {
      name: 'Settlement 1',
      amount:230,
      date: '2023-10-01',
      status: 'Pending',

    },
    {
      name: 'Settlement 2',
      amount: 150,
      date: '2023-10-02',
      status: 'Completed',
    },
    {
      name: 'Settlement 3',
      amount: 300,
      date: '2023-10-03',
      status: 'Pending',
    },
    {
      name: 'Settlement 4',
      amount: 120,
      date: '2023-10-04',
      status: 'Completed',
    },
    {
      name: 'Settlement 5',
      amount: 200,
      date: '2023-10-05',
      status: 'Pending',
    },
  ]
  constructor() {}


  ionViewDidEnter() {
    // Calculate earnings when the view is entered
    const earnings = this.calculateEarnings(this.settlements);
    this.Uamount = earnings.unsettledAmount;
    this.Samount = earnings.settledAmount;
    console.log('Total Earnings:', earnings.totalEarnings);
    console.log('Settled Amount:', this.Samount);
    console.log('Unsettled Amount:', this.Uamount);

  }

  requestForSettlements() {
    // Logic to request settlements can be added here
    console.log('Request for settlements initiated.');
  }


  download()  {
    // Logic to download the settlements can be added here
    console.log('Download initiated.');
  }

  calculateEarnings(settlements:any) {
    let totalEarnings = 0;
    let settledAmount = 0;
    let unsettledAmount = 0;
  
    // Iterate through the settlements to calculate the amounts
    settlements.forEach((settlement:any) => {
      totalEarnings += settlement.amount;
      if (settlement.status === 'Completed') {
        settledAmount += settlement.amount;
      } else {
        unsettledAmount += settlement.amount;
      }
    });
  
    return {
      totalEarnings,
      settledAmount,
      unsettledAmount
    };
  }

}
