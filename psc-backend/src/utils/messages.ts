export const OTP_MSG = `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; line-height: 1.6;">
<tr>
<td>

<p><strong>Dear Mr. {{memberName}}</strong></p>

<p>
We are pleased to inform you that a unique One-Time PIN has been generated for your login to the Peshawar Services Club Mobile App.
</p>

<p>
  <strong>Your Login PIN:</strong>
</p>
<div style="
  background-color: #f8f9fa;
  border: 2px dashed #2b3a55;
  color: #2b3a55;
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 5px;
  padding: 15px;
  text-align: center;
  border-radius: 8px;
  margin: 20px 0;
  display: inline-block;
  min-width: 150px;
">
  {{pinCode}}
</div>

<p><strong>Please note the following important instructions:</strong></p>

<ul>
<li>This PIN is for one-time use only and is required to complete your login.</li>
<li>The PIN is valid for one hour only. Once expired, you are requested to generate a new PIN via the mobile app.</li>
<li>Do not share this PIN with anyone under any circumstances.</li>
<li>For your security, please log out of the app before selling, changing, or handing over your mobile phone.</li>
<li>PSC will not be responsible for any misuse of the app resulting from sharing your PIN or negligence.</li>
<li>The PSC Mobile App includes features with financial implications. Any request, transaction, or activity made through your account will be considered your responsibility.</li>
<li>If you did not request this PIN or notice any suspicious activity, please contact the PSC Main Office immediately.</li>
</ul>

<p>
Thank you for your cooperation in helping us maintain the security of our digital services.
</p>

<p>
Warm regards,<br><br>
Management<br>
Peshawar Services Club<br>
091-9212753-4
</p>

<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
  <p>This is an automated message. Please do not reply directly to this email.</p>
  <p>© ${new Date().getFullYear()} Peshawar Services Club</p>
</div>

<div style="display: none; visibility: hidden; opacity: 0; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; overflow: hidden;">
  Reference ID: {{timestamp}}
</div>

</td>
</tr>
</table>
`;

export const createRequestEmailContent = (
  member: any,
  club: any,
  request: any,
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Introductory Letter</title>
      <style>
        body {
          font-family: "Georgia", serif;
          background: #f2f2f2;
          margin: 0;
          padding: 40px;
        }
        .letter-container {
          background: #ffffff;
          max-width: 800px;
          margin: auto;
          padding: 60px 50px;
          text-align: center;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .logo { width: 180px; margin-bottom: 20px; }
        h1 { font-style: italic; text-decoration: underline; font-size: 22px; margin-bottom: 30px; }
        .meta { text-align: left; font-size: 14px; margin-bottom: 30px; }
        .meta strong { font-weight: bold; }
        .content { font-size: 20px; line-height: 1.6; margin: 30px 0; }
        .content strong { font-weight: bold; }
        .footer { margin-top: 40px; font-size: 20px; }
        .signature { margin-top: 30px; font-weight: bold; font-size: 22px; }
        .club-name { font-size: 20px; margin-top: 5px; }
        .phone { margin-top: 5px; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="letter-container">
        <img src="https://res.cloudinary.com/dtqdpntlc/image/upload/v1772616023/logo_rghsf6.png" class="logo" alt="Club Logo" />

        <h1>INTRODUCTORY LETTER</h1>

        <div class="meta">
          <div><strong>Serial No:</strong> ${request.id}</div>
          <div><strong>Date:</strong> ${new Date(request.createdAt ?? Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>

        <div class="content">
          I have the honor to introduce
          <strong>Mr. ${member.Name}</strong> with family,
          Membership No. <strong>${member.Membership_No}</strong>,
          a bonafide Member of Peshawar Services Club,
          who will be visiting <strong>${club.name}</strong>
          on <strong>${new Date(request.requestedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
          <br /><br />
          Thank you for your kind cooperation!
        </div>

        <div class="footer">Best Regards,</div>
        <div class="signature">Secretary</div>
        <div class="club-name">Peshawar Services Club</div>
        <div class="phone">091-9212753-5</div>
      </div>
    </body>
    </html>
  `;
}

export const sendMailMemberAff = (
  status: 'APPROVED' | 'REJECTED',
  member: any,
  club: any,
  purpose: string,
  requestId: number,
  reqDate: string,
) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2b3a55;">${club?.name} Visit Request – ${status} (Request ID: ${requestId})</h2>

      <p>Dear ${member?.name || 'Member'},</p>

      ${status === 'APPROVED'
      ? `<p>
        Your request to visit <strong>${club?.name}</strong> has been successfully received and Accepted.
      </p>`
      : `<p>
        Your request to visit <strong>${club?.name}</strong> has been Rejected.
      </p>`
    }

      <h3 style="margin-top: 20px;">Request Details</h3>
      <ul>
        <li><strong>Request ID:</strong> ${requestId}</li>
        <li><strong>Request Date:</strong> ${reqDate}</li>
        <li><strong>Club:</strong> ${club?.name}</li>
        <li><strong>Purpose of Visit:</strong> ${purpose}</li>
      </ul>

      <p>
        The respective club will review your request and will contact you shortly via 
        <strong>email</strong> or <strong>phone call</strong> with further instructions and confirmation 
        of your visit schedule.
      </p>

      <p>Thank you for your patience.<br/>
      <strong>Peshawar Services Club</strong></p>
    </div>
  `;
};

export const sendMailClubAff = (
  member: any,
  club: any,
  purpose: string,
  requestId: number,
  visitDate: string,
) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2b3a55;">Club Visit Request (ID: ${requestId})</h2>

      <p>Dear ${club?.name},</p>

      <p>
        A member from our club has requested to visit your facility.
      </p>

      <h3 style="margin-top: 20px;">Member Details</h3>
      <ul>
        <li><strong>Name:</strong> ${member?.Name}</li>
        <li><strong>Membership No:</strong> ${member?.Membership_No}</li>
        <li><strong>Contact:</strong> ${member?.Email || ''} ${member?.Contact_No ? ' / ' + member.Contact_No : ''}</li>
      </ul>

      <h3 style="margin-top: 20px;">Visit Request Details</h3>
      <ul>
        <li><strong>Request ID:</strong> ${requestId}</li>
        <li><strong>Requested Club:</strong> ${club?.name}</li>
        <li><strong>Purpose of Visit:</strong> ${purpose}</li>
        <li><strong>Expected Visit Date:</strong> ${visitDate}</li>
      </ul>

      <p>
        Please review the request and contact the member if any additional information is required.
        You may reach out to the member directly using the details provided above.
      </p>

      <p>Thank you.<br/>
      <strong>Peshawar Services Club</strong></p>
    </div>
  `;
};

const formatConfirmationDate = (value: any) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB');
};

const formatConfirmationTime = (value: any) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const getConfirmationRequestDate = (booking: any) =>
  formatConfirmationDate(booking?.createdAt || booking?.requestedAt || booking?.bookingDate || booking?.checkInDate);

const getConfirmationRequestTime = (booking: any) =>
  formatConfirmationTime(booking?.createdAt || booking?.requestedAt || booking?.bookingDate || booking?.checkInDate);

const getConfirmationMemberName = (member: any) =>
  member?.Name || member?.name || 'Member';

export const confirmations = {
  roomBookingConfirmation: (member: any, room: any, booking: any) => {
    const memberName = getConfirmationMemberName(member);
    const requestDate = getConfirmationRequestDate(booking);
    const requestTime = getConfirmationRequestTime(booking);
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background:#f7f7f7; padding:24px;">
      <div style="max-width:760px; margin:auto; background:#fff; padding:28px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <h1 style="color:#2b3a55; font-size:20px; margin-bottom:6px;">Guestroom Booking Confirmation – Peshawar Services Club (PSC)</h1>
        <p>Dear ${memberName},</p>
        <p>Assalam-o-Alaikum,</p>
        <p>We are pleased to confirm your Guestroom booking at Peshawar Services Club (PSC), requested via the Mobile App on ${requestDate} at ${requestTime}, under Booking ID: ${booking?.id ?? ''}.</p>
        <p>We appreciate your preference for PSC and look forward to providing you with a comfortable and pleasant stay.</p>
        <p>To ensure smooth operations and a hassle-free experience, you are kindly requested to review and follow the Standard Operating Procedures (SOPs) and Instructions, which are available in the Mobile App under your booking section.</p>
        <p>________________________________________</p>
        <h3>Important Guestroom Guidelines &amp; Policies (Summary)</h3>
        <p><strong>1. Check-in &amp; Check-out</strong></p>
        <ul>
          <li>Check-in and check-out timings must be observed as per Club policy.</li>
          <li>Late check-out are subject to availability and approval and extra charges will be applied as per policy.</li>
        </ul>
        <p><strong>2. Identification &amp; Registration</strong></p>
        <ul>
          <li>Valid membership card and CNIC are required at the time of check-in.</li>
          <li>Guest details must be registered at the reception/booking desk.</li>
        </ul>
        <p><strong>3. Payment &amp; Billing</strong></p>
        <ul>
          <li>Room charges and applicable taxes must be settled in advance or as per policy.</li>
          <li>Any additional services availed during stay will be billed separately.</li>
          <li>Outstanding amounts, if any, will be added to the member’s account.</li>
        </ul>
        <p><strong>4. Use of Facilities &amp; Conduct</strong></p>
        <ul>
          <li>Guests are requested to maintain decorum and observe Club rules.</li>
          <li>Smoking, loud music, and disturbance to other guests are strictly prohibited.</li>
          <li>Members are responsible for the conduct of their guests.</li>
        </ul>
        <p><strong>5. Safety &amp; Property Responsibility</strong></p>
        <ul>
          <li>Any loss, damage, or misuse of Club property will be charged accordingly.</li>
          <li>PSC shall not be responsible for loss of personal belongings.</li>
        </ul>
        <p><strong>6. Cancellation &amp; Refund Policy</strong></p>
        <p>In case of cancellation, a formal request must be submitted through the Mobile App or Administration Office. Refunds (if applicable) will be processed as per the following policy:</p>
        <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse; width:100%; font-size:13px;">
          <thead>
            <tr>
              <th rowspan="3">No. of Rooms</th>
              <th rowspan="3">Minimum Payment</th>
              <th colspan="4">Cancellation<br />(Advance payment Non-Refundable)</th>
            </tr>
            <tr>
              <th>Informed Before 72 Hrs</th>
              <th>Informed Less within 72 Hrs</th>
              <th>Informed within 24 Hrs</th>
              <th>Unoccupied Room</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Upto 2 Rooms</td>
              <td>25%</td>
              <td>5%</td>
              <td>10%</td>
              <td>25%</td>
              <td>100 % Room rent will be charged in member’s monthly Bill</td>
            </tr>
            <tr>
              <td>Upto 3–5 Rooms</td>
              <td>50%</td>
              <td>15%</td>
              <td>25%</td>
              <td>50%</td>
              <td>100 % Room rent will be charged in member’s monthly Bill</td>
            </tr>
            <tr>
              <td>Upto 6–8 Rooms</td>
              <td>75%</td>
              <td>25%</td>
              <td>50%</td>
              <td>75%</td>
              <td>100 % Room rent will be charged in member’s monthly Bill</td>
            </tr>
          </tbody>
        </table>
        <p><strong>Important Note</strong></p>
        <p>Members are required to initiate cancellation requests through the PSC Mobile App and inform the Guestroom Reception for confirmation.</p>
        <p>In case a member fails to initiate the cancellation request or does not inform the Guestroom Reception at 091-9212753-4 / 0345-8518696, NO REFUND will be entertained, and charges will be applied in accordance with the above policy.</p>
        <p>________________________________________</p>
        <p>For detailed procedures, kindly refer to the SOPs available in the Mobile App.</p>
        <p>Please feel free to contact the Reception Desk during working hours at 091-9212753-4 / 0345-8518696</p>
        <p>We look forward to welcoming you and wish you a pleasant stay at Peshawar Services Club.</p>
        <p>Warm regards,<br/>Management<br/>Peshawar Services Club<br/>0345-8518696</p>
      </div>
    </div>
  `;
  },
  hallbookingConfirmation: (member: any, hall: any, booking: any) => {
    const memberName = getConfirmationMemberName(member);
    const requestDate = getConfirmationRequestDate(booking);
    const requestTime = getConfirmationRequestTime(booking);
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background:#f7f7f7; padding:24px;">
      <div style="max-width:760px; margin:auto; background:#fff; padding:28px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <h1 style="color:#2b3a55; font-size:20px; margin-bottom:6px;">Hall Booking Confirmation – Peshawar Services Club (PSC)</h1>
        <p>Dear ${memberName},</p>
        <p>Assalam-o-Alaikum,</p>
        <p>We are pleased to confirm your Hall/Event booking at Peshawar Services Club (PSC), requested via the Mobile App on ${requestDate} at ${requestTime}, under Booking ID: ${booking?.id ?? ''}.</p>
        <p>We thank you for choosing PSC for your special occasion and assure you of our best services to make your event successful and memorable.</p>
        <p>To ensure smooth arrangements and compliance with Club policies, you are kindly requested to review the Standard Operating Procedures (SOPs) and Instructions, which are available in the Mobile App under your booking section.</p>
        <p>________________________________________</p>
        <h3>Important Guidelines &amp; Policies (Summary)</h3>
        <p><strong>1. Booking &amp; Registration</strong></p>
        <ul>
          <li>All event bookings are processed through the Booking Officer/F&amp;B Department.</li>
          <li>Event details, guest count, and contact information must be accurately registered in the system.</li>
          <li>A minimum advance payment of Rs. 50,000 is required, or full payment may be deposited at the time of booking.</li>
          <li>A confirmation receipt and SMS notification will be issued upon registration.</li>
        </ul>
        <p><strong>2. Menu &amp; Venue Arrangements</strong></p>
        <ul>
          <li>Members may select from approved buffet and Hi-Tea menus.</li>
          <li>Any additional menu items are subject to management approval.</li>
          <li>Menu, stage setup, and décor arrangements must be finalized at least 20 days prior to the event.</li>
          <li>Seating plans and theme preferences must be communicated in advance.</li>
        </ul>
        <p><strong>3. Payment &amp; Finalization</strong></p>
        <ul>
          <li>Full payment must be cleared before the event date.</li>
          <li>Additional guests beyond the approved count will be charged accordingly and must be settled on the same day.</li>
          <li>Any unresolved balance will be added to the member’s account.</li>
        </ul>
        <p><strong>4. Media, Security &amp; Compliance</strong></p>
        <ul>
          <li>Media personnel and foreign guests are not permitted without prior approval.</li>
          <li>Outside food, décor, DJs, fireworks, and firing are strictly prohibited.</li>
          <li>All rates are inclusive of taxes and service charges.</li>
          <li>Membership number and CNIC copy of guests are mandatory at booking.</li>
        </ul>
        <p><strong>5. Event Timings</strong></p>
        <ul>
          <li>Lunch: 11:00 AM – 3:00 PM</li>
          <li>Dinner: 7:00 PM – 11:00 PM</li>
        </ul>
        <p>Exceeding allotted time will incur a penalty of Rs. 20,000 per hour.</p>
        <p><strong>6. Cancellation &amp; Refund Policy</strong></p>
        <p>In case of cancellation due to valid reasons, a formal written request addressed to the Secretary is required. Refunds (subject to approval) will be processed as follows:</p>
        <ul>
          <li>20 days or more before event: 100% refund</li>
          <li>12–20 days before event: 50% refund</li>
          <li>5–12 days before event: 25% refund</li>
          <li>Less than 5 days before event: No refund</li>
        </ul>
        <p><strong>7. Accountability &amp; Responsibility</strong></p>
        <ul>
          <li>Members are responsible for the conduct of their guests.</li>
          <li>Any damage, misconduct, or policy violation will be dealt with as per Club rules.</li>
          <li>Applicable charges may be imposed where necessary.</li>
        </ul>
        <p>________________________________________</p>
        <p>For detailed procedures and instructions, please refer to the SOPs available in the Mobile App.</p>
        <p>We look forward to hosting your event and wish you a pleasant and memorable experience at PSC.</p>
        <p>Warm regards,<br/>Management<br/>Peshawar Services Club<br/>03419777711</p>
      </div>
    </div>
  `;
  },
  lawnbookingConfirmation: (member: any, lawn: any, booking: any) => {
    const memberName = getConfirmationMemberName(member);
    const requestDate = getConfirmationRequestDate(booking);
    const requestTime = getConfirmationRequestTime(booking);
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background:#f7f7f7; padding:24px;">
      <div style="max-width:760px; margin:auto; background:#fff; padding:28px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <h1 style="color:#2b3a55; font-size:20px; margin-bottom:6px;">Lawn Booking Confirmation – Peshawar Services Club (PSC)</h1>
        <p>Dear ${memberName},</p>
        <p>Assalam-o-Alaikum,</p>
        <p>We are pleased to confirm your Lawn/Event booking at Peshawar Services Club (PSC), requested via the Mobile App on ${requestDate} at ${requestTime}, under Booking ID: ${booking?.id ?? ''}.</p>
        <p>We thank you for choosing PSC for your special occasion and assure you of our best services to make your event successful and memorable.</p>
        <p>To ensure smooth arrangements and compliance with Club policies, you are kindly requested to review the Standard Operating Procedures (SOPs) and Instructions, which are available in the Mobile App under your booking section.</p>
        <p>________________________________________</p>
        <h3>Important Guidelines &amp; Policies (Summary)</h3>
        <p><strong>1. Booking &amp; Registration</strong></p>
        <ul>
          <li>All event bookings are processed through the Booking Officer/F&amp;B Department.</li>
          <li>Event details, guest count, and contact information must be accurately registered in the system.</li>
          <li>A minimum advance payment of Rs. 50,000 is required, or full payment may be deposited at the time of booking.</li>
          <li>A confirmation receipt and SMS notification will be issued upon registration.</li>
        </ul>
        <p><strong>2. Menu &amp; Venue Arrangements</strong></p>
        <ul>
          <li>Members may select from approved buffet and Hi-Tea menus.</li>
          <li>Any additional menu items are subject to management approval.</li>
          <li>Menu, stage setup, and décor arrangements must be finalized at least 20 days prior to the event.</li>
          <li>Seating plans and theme preferences must be communicated in advance.</li>
        </ul>
        <p><strong>3. Payment &amp; Finalization</strong></p>
        <ul>
          <li>Full payment must be cleared before the event date.</li>
          <li>Additional guests beyond the approved count will be charged accordingly and must be settled on the same day.</li>
          <li>Any unresolved balance will be added to the member’s account.</li>
        </ul>
        <p><strong>4. Media, Security &amp; Compliance</strong></p>
        <ul>
          <li>Media personnel and foreign guests are not permitted without prior approval.</li>
          <li>Outside food, décor, DJs, fireworks, and firing are strictly prohibited.</li>
          <li>All rates are inclusive of taxes and service charges.</li>
          <li>Membership number and CNIC copy of guests are mandatory at booking.</li>
        </ul>
        <p><strong>5. Event Timings</strong></p>
        <ul>
          <li>Lunch: 11:00 AM – 3:00 PM</li>
          <li>Dinner: 7:00 PM – 11:00 PM</li>
        </ul>
        <p>Exceeding allotted time will incur a penalty of Rs. 20,000 per hour.</p>
        <p><strong>6. Cancellation &amp; Refund Policy</strong></p>
        <p>In case of cancellation due to valid reasons, a formal written request addressed to the Secretary is required. Refunds (subject to approval) will be processed as follows:</p>
        <ul>
          <li>20 days or more before event: 100% refund</li>
          <li>12–20 days before event: 50% refund</li>
          <li>5–12 days before event: 25% refund</li>
          <li>Less than 5 days before event: No refund</li>
        </ul>
        <p><strong>7. Accountability &amp; Responsibility</strong></p>
        <ul>
          <li>Members are responsible for the conduct of their guests.</li>
          <li>Any damage, misconduct, or policy violation will be dealt with as per Club rules.</li>
          <li>Applicable charges may be imposed where necessary.</li>
        </ul>
        <p>________________________________________</p>
        <p>For detailed procedures and instructions, please refer to the SOPs available in the Mobile App.</p>
        <p>We look forward to hosting your event and wish you a pleasant and memorable experience at PSC.</p>
        <p>Warm regards,<br/>Management<br/>Peshawar Services Club<br/>03419777711</p>
      </div>
    </div>
  `;
  },
  photoshootBookingConfirmation: (member: any, photoshoot: any, booking: any) => {
    const memberName = getConfirmationMemberName(member);
    const requestDate = getConfirmationRequestDate(booking);
    const requestTime = getConfirmationRequestTime(booking);
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background:#f7f7f7; padding:24px;">
      <div style="max-width:760px; margin:auto; background:#fff; padding:28px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <h1 style="color:#2b3a55; font-size:20px; margin-bottom:6px;">Photoshoot Booking Confirmation – Peshawar Services Club (PSC)</h1>
        <p>Dear ${memberName},</p>
        <p>Assalam-o-Alaikum,</p>
        <p>We are pleased to confirm your Photoshoot booking at Peshawar Services Club (PSC), requested via the Mobile App on ${requestDate} at ${requestTime}, under Booking ID: ${booking?.id ?? ''}.</p>
        <p>We sincerely thank you for choosing PSC for your special moments. Our team is committed to providing you with a pleasant and well-organized experience.</p>
        <p>To ensure smooth operations and compliance with Club regulations, we kindly request you to review and follow the Standard Operating Procedures (SOPs) and Instructions available in the Mobile App under the booking section.</p>
        <h3>Important Guidelines &amp; Terms</h3>
        <ul>
          <li>Members are requested to arrive on time as per their confirmed booking schedule.</li>
          <li>All photography activities must be conducted within the approved areas only.</li>
          <li>Members and photographers are required to follow Club decorum and policies at all times.</li>
          <li>Any damage to Club property during the photoshoot shall be the responsibility of the member.</li>
          <li>PSC reserves the right to regulate or stop activities that violate Club rules.</li>
          <li>No refund shall be admissible in case of cancellation, postponement, or non-utilization of the booking.</li>
          <li>Kindly ensure that your registered contact and email details are up to date for future correspondence.</li>
        </ul>
        <p>For any assistance or clarification, please feel free to contact the Booking Office during working hours or call at 03419777711</p>
        <p>We look forward to serving you and hope your experience at PSC will be memorable.</p>
        <p>Warm regards,<br/>Management<br/>Peshawar Services Club<br/>03419777711</p>
      </div>
    </div>
  `;
  },

  billPaymentConfirmation: (member: any, payment: any) => {
    const memberName = getConfirmationMemberName(member);
    const dateStr = payment?.date ? new Date(payment.date).toLocaleString('en-GB') : new Date().toLocaleString('en-GB');
    return `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; background:#f7f7f7; padding:24px;">
      <div style="max-width:760px; margin:auto; background:#fff; padding:28px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <h1 style="color:#2b3a55; font-size:20px; margin-bottom:6px;">Payment Confirmation Receipt – Monthly Bill (PSC Mobile App)</h1>
        <p>Dear ${memberName},</p>
        <p>Assalam-o-Alaikum,</p>
        <p>We are pleased to acknowledge the receipt of your monthly bill payment made through the PSC Mobile App via KuickPay.</p>
        <h3>Payment Details</h3>
        <ul>
          <li>Member Name: ${memberName}</li>
          <li>Membership No.: ${member?.Membership_No || payment?.membershipNo || ''}</li>
          <li>Amount Paid: Rs. ${payment?.amount || ''}</li>
          <li>Payment Method: KuickPay (Mobile App)</li>
          <li>Transaction Date: ${dateStr}</li>
          <li>Transaction Reference No.: ${payment?.reference || ''}</li>
        </ul>
        <p>This email serves as your official confirmation receipt for the above-mentioned transaction.</p>
        <p>We sincerely appreciate your timely payment and continued cooperation.</p>
        <p>In case of any discrepancy, clarification, or query regarding your billing or payment, please feel free to contact the Accounts Department during working hours at 0919212753-4</p>
        <p>Thank you for being a valued member of Peshawar Services Club.</p>
        <p>Warm regards,</p>
        <p>Management<br/>Peshawar Services Club<br/>0919212753-4</p>
      </div>
    </div>
  `;
  },

  cancellationAccept: ()=>{

  },
  cancellationReject: ()=>{

  },

  feedbackCreated: (member: any, feedback: any)=>{
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2b3a55;">Feedback Created (ID: ${feedback.id})</h2>

      <p>Dear ${member?.name || 'Member'},</p>

      <p>
        Your feedback has been successfully created.
      </p>

      <h3 style="margin-top: 20px;">Feedback Details</h3>
      <ul>
        <li><strong>Feedback ID:</strong> ${feedback.id}</li>
        <li><strong>Feedback:</strong> ${feedback.feedback}</li>
        <li><strong>Feedback Date:</strong> ${feedback.feedbackDate}</li>
      </ul>

      <p>
        Please review the feedback details and contact the club if any additional information is required.
      </p>

      <p>Thank you.<br/>
      <strong>Peshawar Services Club</strong></p>
    </div>
  `;
  },
  feedbackAck:()=>{

  },
  

}
