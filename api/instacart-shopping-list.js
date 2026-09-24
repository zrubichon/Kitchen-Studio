export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.INSTACART_API_KEY;
  if (!key) return res.status(503).json({ error: 'INSTACART_API_KEY is not configured' });
  const { title = 'Mise — Liste de courses', line_items = [] } = req.body || {};
  const normalizedItems = line_items.map((item) => ({
    name: item.name,
    line_item_measurements: item.line_item_measurements?.length
      ? item.line_item_measurements
      : [{ quantity: item.quantity ?? 1, unit: item.unit ?? 'each' }]
  }));
  try {
    const upstream = await fetch('https://connect.instacart.com/idp/v1/products/products_link', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ title, link_type: 'shopping_list', expires_in: 7, line_items: normalizedItems })
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Instacart request failed' });
  }
}
