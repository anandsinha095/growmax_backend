module.exports = Object.freeze({
  error: {
    'Something_want_wrong' : 'Something went wrong',
    },
  batch: {
     'batch_not_inserted':'New Batch not created ! Try after sometime !',
     'batch_already_exist': 'Batch already exist in same program!',
     'batch_schedule_not_inserted': 'New Batch schedule not created ! Try after sometime !',
     'batch_added_successfully': 'Batch added successfully !',
     'unable_to_update_batch': 'Unable to update the batch! Try again after sometime !',
     'updated_batch_successfully': 'Batch details Updated successfully !',
     //'batch_duration_issue': 'Batch total duration is not equal to total duration'
     'batch_duration_issue': 'Batch schedule is pending !'
  },
  leads: {
    'lead_created_successfully' :'Lead created successfully  !',
    'lead_result_error' : 'Lead status should be closed for changing the Lead result',
    'lead_updated_successfully' : 'Lead updated successfully  !',
    'unable_to_update_lead' : 'Unable to update the Lead details! Try again later !'
  },
  customers:{
      'primary_customer_data_created': 'Customer data inseted',
      'unable_to_insert_customer_info': 'Unable to insert customer info ! try after sometime',
      'unable_to_update_customer_details':'Unable to update the customer details! Try again later !',
      'email_already_exist': 'Email id already exist',
  },
  notes: {
    'unable_to_insert_notes' : 'unable to insert second contact',

  }
});