import { get } from 'axios';

async () => {
    const response = await get(process.env.GMSAPI_URL + "/atom.php?action=getstatus");

    const pPersonNumber = response.data

    const response2 = await get(process.env.ATOMAPI_URL + "/Enroll/" + pPersonNumber + '/?IPAddress=' + process.env.SERVER_PC_IP);

    const response3 = await get(process.env.GMSAPI_URL + "/atom.php?action=clearstatus");

}