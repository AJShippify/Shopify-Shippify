const Router = require('express').Router
const ShopifyApp = require('./../../../models/ShopifyApp')
const ServerResponse = require('./../../../utils/server-response')
const verifyShopifyWebhook = require('./../../middlewares/verify-shopify-webhook')

const verifyShippifyAppWebhook = verifyShopifyWebhook(ShopifyApp.shippify)

const router = new Router()

// TODO: Call Shippify API. Base on this https://help.shopify.com/api/reference/webhook

router.post('/orders/create', verifyShippifyAppWebhook, (request, response) => {
  const {
    id, line_items: lineItems, shipping_address: {
      name: receiverName, phone: receiverPhone, address1, address2, city, province, country
    },
    customer: { email: receiverEmail }
  } = request.body
  const dropoffAddress = [address1, address2, city, province, country]
  .filter(component => component)
  .join(', ')
  const order = {
    id,
    platform: 'shopify',
    items: lineItems.map(({ id, name, quantity }) => ({
      id,
      name,
      quantity,
      size: 2
    })),
    dropoff: {
      contact: {
        name: receiverName,
        email: receiverEmail,
        phone: receiverPhone
      },
      location: {
        address: dropoffAddress
      }
    }
  }
  return ServerResponse.noContent().respond(response)
})

module.exports = router
