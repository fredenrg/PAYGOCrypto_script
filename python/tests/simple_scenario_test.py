import os
import sys
import inspect
import json

parentdir = os.path.dirname(
    os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
)
sys.path.insert(0, parentdir)
from simulators.device_simulator import DeviceSimulator
from simulators.server_simulator import SingleDeviceServerSimulator, OPAYGOShared
from datetime import datetime, timedelta
import codecs


def assert_time_equals(time1, time2):
    assert time1.replace(second=0, microsecond=0) == time2.replace(
        second=0, microsecond=0
    )


if __name__ == "__main__":
    # ------ IMPORTANT WARNING --------
    # DO NOT USE THIS KEY IN PRODUCTION
    # IT IS JUST AN EXAMPLE
    # ---------------------------------
    script_data = json.loads(sys.argv[1])
    device_key_hex = str(script_data["Key"])
    device_key = codecs.decode(device_key_hex, "hex")
    device_starting_code = int(
        script_data["StartingCode"]
    )  # Generated by fair dice roll
    restricted_digit_set = False
    days = int(script_data["days"])
    count = int(script_data["Count"])

    # print(str(sys.argv[1]))
    # print(str(sys.argv[2]))
    # print(str(sys.argv[3]))

    # print('Device: We initiate the device simulator with our device')
    device_simulator = DeviceSimulator(
        device_starting_code,
        device_key,
        count,
        restricted_digit_set=restricted_digit_set,
        waiting_period_enabled=False,
    )
    # print('Server: We initiate the server simulator with our device')
    server_simulator = SingleDeviceServerSimulator(
        device_starting_code,
        device_key,
        count,
        restricted_digit_set=restricted_digit_set,
    )

    print("\n")
    # print('Server: We add 1 days of activation for the device')
    this_token = server_simulator.generate_token_from_date(
        datetime.now() + timedelta(days=days)
    )
    print(this_token)
    # print(str(sys.argv[1]))
    # print(int(sys.argv[2]))
    # print('Device: We enter the generated token into the device')
    device_simulator.enter_token(this_token)
    # print('Device: We check the device status (should be active with 1 day)')
    device_simulator.print_status()
    assert device_simulator.count == server_simulator.count
    # print(device_simulator.count)
    # print(server_simulator.count)
    assert_time_equals(
        device_simulator.expiration_date, datetime.now() + timedelta(days=days)
    )
