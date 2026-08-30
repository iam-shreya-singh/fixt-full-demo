export function bookingConfirmedCustomerEmail(businessName: string, serviceName: string, whenLabel: string, cancellationUrl: string) {
    return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h1 style="font-size:20px">You're on the calendar.</h1>
      <p>Your appointment with <strong>${businessName}</strong> is confirmed.</p>
      <p><strong>${serviceName}</strong><br/>${whenLabel}</p>
      <p><a href="${cancellationUrl}" style="color:#B5763A">Need to cancel? Manage your booking</a></p>
    </div>`
  }
  
  export function bookingConfirmedOwnerEmail(customerName: string, serviceName: string, whenLabel: string) {
    return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h1 style="font-size:20px">New booking.</h1>
      <p><strong>${customerName}</strong> booked <strong>${serviceName}</strong>.</p>
      <p>${whenLabel}</p>
    </div>`
  }
  
  export function bookingCancelledOwnerEmail(customerName: string, serviceName: string, whenLabel: string) {
    return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h1 style="font-size:20px">Booking cancelled.</h1>
      <p><strong>${customerName}</strong> cancelled <strong>${serviceName}</strong>.</p>
      <p>${whenLabel} is now open again.</p>
    </div>`
  }
  
  export function bookingCancelledCustomerEmail(businessName: string, serviceName: string, whenLabel: string) {
    return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h1 style="font-size:20px">Your appointment was cancelled.</h1>
      <p><strong>${businessName}</strong> cancelled your <strong>${serviceName}</strong> appointment (${whenLabel}).</p>
    </div>`
  }