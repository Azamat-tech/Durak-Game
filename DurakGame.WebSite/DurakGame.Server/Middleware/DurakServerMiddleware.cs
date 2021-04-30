﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net.WebSockets;
using System.Text;
using Microsoft.AspNetCore.Http;
using System.Text.Json;
using Newtonsoft.Json;

namespace DurakGame.Server.Middleware
{
    public class DurakServerMiddleware
    {
        private readonly RequestDelegate _next;

        private readonly DurakServerConnectionManager _manager;
        public DurakServerMiddleware(RequestDelegate next, DurakServerConnectionManager manager)
        {
            _next = next;
            _manager = manager;
        }
         
        public async Task InvokeAsync(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                WebSocket websocket = await context.WebSockets.AcceptWebSocketAsync();
                Console.WriteLine("WebSocket Connected");

                string playerID = _manager.AddSocket(websocket);
                //int totalPlayers = _manager.ReturnNumberOfPlayers();

                //await SendTotalNumberOfPlayersAsync(websocket, totalPlayers);

                await SendPlayerIDAsync(websocket, playerID);

                await ReceiveMessage(websocket, async (result, buffer) =>
                {
                    Console.WriteLine(result);
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        Console.WriteLine("Receive -----> Text");
                        Console.WriteLine($"Message : {Encoding.UTF8.GetString(buffer, 0, result.Count)}");
                        await RouteJSONMessageAsync(Encoding.UTF8.GetString(buffer, 0, result.Count));
                        return;
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        string id = _manager.GetAllSockets().FirstOrDefault(s => s.Value == websocket).Key;
                        Console.WriteLine("Receive ----> Close");

                        //WebSocket sock =  _manager.RemoveElementFromSockets(id);
                        _manager.GetAllSockets().TryRemove(id, out WebSocket sock);

                        Console.WriteLine("Managed Connections: " + _manager.GetAllSockets().Count.ToString());

                        await sock.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);

                        return;
                    }
                });
            }
            else
            {
                await _next(context);
            }
        }

        private async Task SendPlayerIDAsync(WebSocket socket, string playerID)
        {
            var buffer = Encoding.UTF8.GetBytes("PlayerID: " + playerID);
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task SendTotalNumberOfPlayersAsync(WebSocket socket, int totalPlayers)
        {
            var buffer = Encoding.UTF8.GetBytes(totalPlayers.ToString());
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task ReceiveMessage(WebSocket socket, Action<WebSocketReceiveResult, byte[]> handleMessage)
        {
            var buffer = new byte[1024 * 4];

            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(buffer: new ArraySegment<byte>(buffer),
                    cancellationToken: CancellationToken.None);

                handleMessage(result, buffer);
            }
        }

        private async Task RouteJSONMessageAsync(string message)
        {
            var routeOb = JsonConvert.DeserializeObject<dynamic>(message);
            Console.WriteLine("To: " + routeOb.To.ToString());

            if (Guid.TryParse(routeOb.To.ToString(), out Guid guidout))
            {
                /*
                var sock = _manager.GetAllSockets().FirstOrDefault(s => s.Key == routeOb.To.ToString());
                if(sock.Value != null)
                {
                    if(sock.Value.State == WebSocketState.Open)
                    {
                        await sock.Value.SendAsync(Encoding.UTF8.GetBytes(routeOb.Message.ToString()),
                            WebSocketMessageType.Text, true, CancellationToken.None);
                    }
                }else
                {
                    Console.WriteLine("Invalid Recepient");
                }
                */
            }
            else
            {
                foreach(var sock in _manager.GetAllSockets())
                {
                    if(sock.Value.State == WebSocketState.Open)
                    {
                        await sock.Value.SendAsync(Encoding.UTF8.GetBytes(routeOb.Message.ToString()),
                            WebSocketMessageType.Text, true, CancellationToken.None);
                    }
                }
            }
        }
    }
}