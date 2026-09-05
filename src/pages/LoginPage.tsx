const { data, error } = await supabase.functions.invoke("send-otp", {
  body: { phone: normalized },
});